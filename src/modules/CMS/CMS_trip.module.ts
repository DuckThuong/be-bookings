import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CMSTripController } from '../../controllers/CMS/CMS_trip.controller';
import { CMSTripService } from '../../services/CMS/CMS_trip.service';
import { CompanyModule } from '../company.module';
import { AuthModule } from '../auth.module';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TbRoad } from '../../entities/road.entity';
import { TbDriver } from '../../entities/driver.entity';
import { TbVehicle } from '../../entities/vehicle.entity';
import { TbTrip } from '../../entities/trip.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TbRoad, TbDriver, TbVehicle, TbTrip]),
    AuthModule,
    CompanyModule,
  ],
  controllers: [CMSTripController],
  providers: [CMSTripService, RolesGuard],
  exports: [CMSTripService],
})
export class CMSTripModule {}
