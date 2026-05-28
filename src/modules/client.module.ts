import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TbCompany } from '../entities/company/company.entity';
import { TbRoad } from '../entities/road.entity';
import { TbTrip } from '../entities/trip.entity';
import { TbCompanyTrip } from '../entities/company/company-trip.entity';
import { TbVehicle } from '../entities/vehicle.entity';
import { TbDriver } from '../entities/driver.entity';
import { TbSeat } from '../entities/seat.entity';
import { TbTicket } from '../entities/ticket.entity';
import { TbBooking } from '../entities/sales/booking.entity';
import { TbPayment } from '../entities/sales/payment.entity';
import { TbRefund } from '../entities/sales/refund.entity';
import { TbCommission } from '../entities/sales/commission.entity';
import { TbBasicUser } from '../entities/user/basic-user.entity';
import { TbInfoUser } from '../entities/user/info-user.entity';
import { ClientCatalogService } from '../services/client-catalog.service';
import { ClientAccountService } from '../services/client-account.service';
import { ClientEnrichmentService } from '../services/client-enrichment.service';
import { ClientCatalogRepository } from '../repositories/client-catalog.repository';
import { ClientAccountRepository } from '../repositories/client-account.repository';
import { TripRepository } from '../repositories/trip.repository';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuthModule } from './auth.module';
import { CompanyModule } from './company.module';
import { SalesModule } from './sales.module';
import { ClientCatalogController } from '../controllers/client/client-catalog.controller';
import { ClientAccountController } from '../controllers/client/client-account.controller';
import { ClientBookingsController } from '../controllers/client/client-bookings.controller';
import { ClientBookingTripResolverService } from '../services/client/client-booking-trip-resolver.service';
import { ClientBookingsService } from '../services/client/client-bookings.service';
import { ClientBookingSeatMapService } from '../services/client/client-booking-seat-map.service';
import { ClientBookingPricingService } from '../services/client/client-booking-pricing.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TbCompany,
      TbRoad,
      TbTrip,
      TbCompanyTrip,
      TbVehicle,
      TbDriver,
      TbSeat,
      TbTicket,
      TbBooking,
      TbPayment,
      TbRefund,
      TbCommission,
      TbBasicUser,
      TbInfoUser,
    ]),
    AuthModule,
    CompanyModule,
    SalesModule,
  ],
  controllers: [
    ClientCatalogController,
    ClientAccountController,
    ClientBookingsController,
  ],
  providers: [
    ClientCatalogService,
    ClientAccountService,
    ClientEnrichmentService,
    ClientCatalogRepository,
    ClientAccountRepository,
    ClientBookingsService,
    ClientBookingTripResolverService,
    ClientBookingSeatMapService,
    ClientBookingPricingService,
    TripRepository,
    RolesGuard,
  ],
  exports: [ClientCatalogService, ClientAccountService, ClientBookingsService],
})
export class ClientModule {}
