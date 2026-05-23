import { Module } from '@nestjs/common';
import { CMSTripController } from '../../controllers/CMS/CMS_trip.controller';
import { CMSTripService } from '../../services/CMS/CMS_trip.service';
import { CompanyModule } from '../company.module';
import { AuthModule } from '../auth.module';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  imports: [AuthModule, CompanyModule],
  controllers: [CMSTripController],
  providers: [CMSTripService, RolesGuard],
  exports: [CMSTripService],
})
export class CMSTripModule {}
