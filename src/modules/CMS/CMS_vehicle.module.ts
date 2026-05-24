import { Module } from '@nestjs/common';
import { CMSVehicleController } from '../../controllers/CMS/CMS_vehicle.controller';
import { CMSVehicleService } from '../../services/CMS/CMS_vehicle.service';
import { CompanyModule } from '../company.module';
import { AuthModule } from '../auth.module';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  imports: [AuthModule, CompanyModule],
  controllers: [CMSVehicleController],
  providers: [CMSVehicleService, RolesGuard],
  exports: [CMSVehicleService],
})
export class CMSVehicleModule {}
