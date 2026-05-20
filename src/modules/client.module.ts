import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TbCompany } from '../entities/company/company.entity';
import { TbRoad } from '../entities/road.entity';
import { TbTrip } from '../entities/trip.entity';
import { TbCompanyTrip } from '../entities/company/company-trip.entity';
import { TbVerhical } from '../entities/verhical.entity';
import { TbDriver } from '../entities/driver.entity';
import { TbSeat } from '../entities/seat.entity';
import { TbTicket } from '../entities/ticket.entity';
import { TbBooking } from '../entities/sales/booking.entity';
import { TbPayment } from '../entities/sales/payment.entity';
import { TbRefund } from '../entities/sales/refund.entity';
import { TbCommission } from '../entities/sales/commission.entity';
import { ClientCatalogController } from '../controllers/client/client-catalog.controller';
import { ClientAccountController } from '../controllers/client/client-account.controller';
import { ClientSeatFlowController } from '../controllers/client/client-seat-flow.controller';
import { ClientBookingFlowController } from '../controllers/client/client-booking-flow.controller';
import { ClientPaymentFlowController } from '../controllers/client/client-payment-flow.controller';
import { ClientCatalogService } from '../services/client-catalog.service';
import { ClientAccountService } from '../services/client-account.service';
import { ClientEnrichmentService } from '../services/client-enrichment.service';
import { ClientCatalogRepository } from '../repositories/client-catalog.repository';
import { ClientAccountRepository } from '../repositories/client-account.repository';
import { ClientSeatFlowService } from '../services/client-flow/client-seat-flow.service';
import { ClientBookingFlowService } from '../services/client-flow/client-booking-flow.service';
import { ClientPaymentFlowService } from '../services/client-flow/client-payment-flow.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuthModule } from './auth.module';
import { CompanyModule } from './company.module';
import { SalesModule } from './sales.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TbCompany,
      TbRoad,
      TbTrip,
      TbCompanyTrip,
      TbVerhical,
      TbDriver,
      TbSeat,
      TbTicket,
      TbBooking,
      TbPayment,
      TbRefund,
      TbCommission,
    ]),
    AuthModule,
    CompanyModule,
    SalesModule,
  ],
  controllers: [
    ClientCatalogController,
    ClientAccountController,
    ClientSeatFlowController,
    ClientBookingFlowController,
    ClientPaymentFlowController,
  ],
  providers: [
    ClientCatalogService,
    ClientAccountService,
    ClientEnrichmentService,
    ClientCatalogRepository,
    ClientAccountRepository,
    ClientSeatFlowService,
    ClientBookingFlowService,
    ClientPaymentFlowService,
    RolesGuard,
  ],
  exports: [
    ClientCatalogService,
    ClientAccountService,
    ClientBookingFlowService,
    ClientPaymentFlowService,
  ],
})
export class ClientModule {}
