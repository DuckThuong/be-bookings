import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CMSBookingController } from '../../controllers/CMS/CMS_booking.controller';
import { CMSBookingService } from '../../services/CMS/CMS_booking.service';
import { AuthModule } from '../auth.module';
import { CompanyModule } from '../company.module';
import { SalesModule } from '../sales.module';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TbTrip } from '../../entities/trip.entity';
import { TbRoad } from '../../entities/road.entity';
import { TbVehicle } from '../../entities/vehicle.entity';
import { TbSeat } from '../../entities/seat.entity';
import { TbTicket } from '../../entities/ticket.entity';
import { TbPayment } from '../../entities/sales/payment.entity';
import { TbBooking } from '../../entities/sales/booking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TbTrip,
      TbRoad,
      TbVehicle,
      TbSeat,
      TbTicket,
      TbPayment,
      TbBooking,
    ]),
    AuthModule,
    CompanyModule,
    SalesModule,
  ],
  controllers: [CMSBookingController],
  providers: [CMSBookingService, RolesGuard],
  exports: [CMSBookingService],
})
export class CMSBookingModule {}
