import { Module } from '@nestjs/common';
import { CMSVehicleController } from '../../controllers/CMS/CMS_vehicle.controller';
import { CMSVehicleService } from '../../services/CMS/CMS_vehicle.service';

@Module({
  controllers: [CMSVehicleController],
  providers: [CMSVehicleService],
  exports: [CMSVehicleService],
})
export class CMSVehicleModule {}
