import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TbPayment } from '../entities/sales/payment.entity';
import { TbTicket } from '../entities/ticket.entity';
import { TbBooking } from '../entities/sales/booking.entity';
import { PayOSController, PayOSWebhookController } from '../controllers/payment/payos.controller';
import { PayOSService } from '../services/payment/payos.service';
import { PaymentRepository } from '../repositories/sales/payment.repository';
import { TicketRepository } from '../repositories/ticket.repository';
import { BookingRepository } from '../repositories/sales/booking.repository';
import { JwtAuthGuard } from '../common/jwt/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([TbPayment, TbTicket, TbBooking]),
    ConfigModule,
  ],
  controllers: [PayOSController, PayOSWebhookController],
  providers: [
    PayOSService,
    PaymentRepository,
    TicketRepository,
    BookingRepository,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [PayOSService],
})
export class PaymentModule {}
