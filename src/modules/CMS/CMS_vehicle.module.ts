import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CMSVehicleController } from '../../controllers/CMS/CMS_vehicle.controller';
import { CMSVehicleService } from '../../services/CMS/CMS_vehicle.service';
import { CompanyModule } from '../company.module';
import { AuthModule } from '../auth.module';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TbTrip } from '../../entities/trip.entity';
import { TbRoad } from '../../entities/road.entity';
import { TbBooking } from '../../entities/sales/booking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TbTrip, TbRoad, TbBooking]),
    AuthModule,
    CompanyModule,
  ],
  controllers: [CMSVehicleController],
  providers: [CMSVehicleService, RolesGuard],
  exports: [CMSVehicleService],
})
export class CMSVehicleModule {}
