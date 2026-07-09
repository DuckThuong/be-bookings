import { Module } from '@nestjs/common';
import { CMSRoadController } from '../../controllers/CMS/CMS_road.controller';
import { CMSRoadService } from '../../services/CMS/CMS_road.service';
import { CompanyModule } from '../company.module';
import { AuthModule } from '../auth.module';
import { MasterDataModule } from '../master-data.module';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  imports: [AuthModule, CompanyModule, MasterDataModule],
  controllers: [CMSRoadController],
  providers: [CMSRoadService, RolesGuard],
  exports: [CMSRoadService],
})
export class CMSRoadModule {}
