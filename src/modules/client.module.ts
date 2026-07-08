import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TbCompany } from '../entities/company/company.entity';
import { TbRoad } from '../entities/road.entity';
import { TbTrip } from '../entities/trip.entity';
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
import { TbMasterData } from '../entities/master-data.entity';
import { ClientAccountService } from '../services/client-account.service';
import { ClientEnrichmentService } from '../services/client-enrichment.service';
import { ClientAccountRepository } from '../repositories/client-account.repository';
import { TripRepository } from '../repositories/trip.repository';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuthModule } from './auth.module';
import { CompanyModule } from './company.module';
import { SalesModule } from './sales.module';
import { PaymentModule } from './payment.module';
import { ClientAccountController } from '../controllers/client/client-account.controller';
import { ClientBookingsController } from '../controllers/client/client-bookings.controller';
import { ClientPromoController } from '../controllers/client/client-promo.controller';
import { ClientBookingsService } from '../services/client/client-bookings.service';
import { ClientTripsService } from '../services/client/client-trips.service';
import { ClientTripsController } from '../controllers/client/client-trips.controller';
import { ClientBookingSeatMapService } from '../services/client/client-booking-seat-map.service';
import { ClientBookingPricingService } from '../services/client/client-booking-pricing.service';
import { ClientBookingTripResolverService } from '../services/client/client-booking-trip-resolver.service';
import { ClientHomeHighlightsController } from '../controllers/client/client-home-highlights.controller';
import { ClientHomeHighlightsService } from '../services/client/client-home-highlights.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TbCompany,
      TbRoad,
      TbTrip,
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
      TbMasterData,
    ]),
    AuthModule,
    CompanyModule,
    SalesModule,
    PaymentModule,
  ],
  controllers: [
    ClientAccountController,
    ClientBookingsController,
    ClientPromoController,
    ClientTripsController,
    ClientHomeHighlightsController,
  ],
  providers: [
    ClientAccountService,
    ClientEnrichmentService,
    ClientAccountRepository,
    ClientBookingsService,
    ClientBookingTripResolverService,
    ClientBookingSeatMapService,
    ClientBookingPricingService,
    ClientTripsService,
    ClientHomeHighlightsService,
    TripRepository,
    RolesGuard,
  ],
  exports: [ClientAccountService, ClientBookingsService],
})
export class ClientModule {}
