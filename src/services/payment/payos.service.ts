import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PayOS } from '@payos/node';
import { getPayOSConfig } from '../../common/payos/payos.config';
import { PaymentMethod } from '../../assets/constants/payment.constants';
import { PaymentStatus } from '../../assets/constants/sales.constants';
import { TicketRepository } from '../../repositories/ticket.repository';
import { PaymentRepository } from '../../repositories/sales/payment.repository';
import { BookingRepository } from '../../repositories/sales/booking.repository';
import { generateEntityCode } from '../../common/helpers/common.helper';
import { SALES_CODE_PREFIX } from '../../assets/constants/sales.constants';
import { TicketStatus } from '../../assets/constants/ticket.constants';
import { BookingStatus } from '../../assets/constants/sales.constants';
import {
  CreatePayOSPaymentDto,
  PayOSPaymentLinkResponseDto,
  PayOSWebhookDto,
} from '../../dtos/payment/payos.dto';

@Injectable()
export class PayOSService {
  private readonly logger = new Logger(PayOSService.name);
  private payOS: PayOS;

  constructor(
    private readonly configService: ConfigService,
    private readonly ticketRepository: TicketRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly bookingRepository: BookingRepository,
  ) {
    const config = getPayOSConfig(this.configService);
    this.payOS = new PayOS({
      clientId: config.clientId,
      apiKey: config.apiKey,
      checksumKey: config.checksumKey,
    });
  }

  async createPaymentLink(
    dto: CreatePayOSPaymentDto,
  ): Promise<PayOSPaymentLinkResponseDto> {
    const ticket = await this.ticketRepository.findById(dto.ticketId);
    if (!ticket) {
      throw new HttpException('Vé không tồn tại', HttpStatus.NOT_FOUND);
    }

    if (ticket.status !== TicketStatus.PENDING) {
      throw new HttpException(
        'Vé không ở trạng thái chờ thanh toán',
        HttpStatus.BAD_REQUEST,
      );
    }

    const config = getPayOSConfig(this.configService);
    const orderCode = Date.now();

    const paymentData = {
      orderCode,
      amount: Math.round(Number(ticket.totalPrice)),
      description: dto.description || `Thanh toán vé #${ticket.id}`,
      returnUrl: config.returnUrl,
      cancelUrl: config.cancelUrl,
    };

    try {
      const paymentLink = await this.payOS.paymentRequests.create(paymentData);

      await this.paymentRepository.save({
        code: generateEntityCode(SALES_CODE_PREFIX.PAYMENT),
        ticketId: ticket.id,
        tripId: ticket.tripId,
        companyId: ticket.companyId,
        customerId: ticket.customerId,
        amount: ticket.totalPrice,
        method: PaymentMethod.PAYOS,
        status: PaymentStatus.PENDING,
        transactionRef: paymentLink.paymentLinkId,
      });

      return {
        checkoutUrl: paymentLink.checkoutUrl,
        paymentLinkId: paymentLink.paymentLinkId,
        qrCode: paymentLink.qrCode || '',
        orderCode,
      };
    } catch (error) {
      this.logger.error('Lỗi tạo payment link PayOS', error);
      throw new HttpException(
        'Không thể tạo liên kết thanh toán',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async handleWebhook(data: PayOSWebhookDto): Promise<void> {
    this.logger.log(`Webhook received for order: ${data.orderCode}`);

    if (data.code !== '00') {
      this.logger.warn(`Webhook failed: ${data.desc}`);
      return;
    }

    const payments = await this.paymentRepository.findByFilter({
      status: PaymentStatus.PENDING,
    });

    const pendingPayment = payments.find(
      (p) => p.transactionRef === data.paymentLinkId,
    );

    if (!pendingPayment) {
      this.logger.warn(`Payment not found for paymentLinkId: ${data.paymentLinkId}`);
      return;
    }

    if (data.status === 'PAID') {
      await this.paymentRepository.update(pendingPayment.id, {
        status: PaymentStatus.SUCCESS,
        paidAt: new Date(),
      });

      await this.ticketRepository.update(pendingPayment.ticketId, {
        status: TicketStatus.PAID,
      });

      const ticket = await this.ticketRepository.findById(pendingPayment.ticketId);
      if (ticket?.bookingId) {
        await this.bookingRepository.update(ticket.bookingId, {
          status: BookingStatus.CONFIRMED,
        });
      }

      this.logger.log(`Payment confirmed for order: ${data.orderCode}`);
    }
  }

  async getPaymentStatus(paymentLinkId: string) {
    try {
      return await this.payOS.paymentRequests.get(paymentLinkId);
    } catch (error) {
      this.logger.error('Lỗi lấy trạng thái thanh toán', error);
      throw new HttpException(
        'Không thể lấy trạng thái thanh toán',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createPaymentRequest(data: {
    orderCode: number;
    amount: number;
    description: string;
    returnUrl: string;
    cancelUrl: string;
  }) {
    return await this.payOS.paymentRequests.create(data);
  }

  async cancelPaymentLink(paymentLinkId: string) {
    try {
      return await this.payOS.paymentRequests.cancel(paymentLinkId);
    } catch (error) {
      this.logger.error('Lỗi hủy payment link', error);
      throw new HttpException(
        'Không thể hủy liên kết thanh toán',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
