import { Module } from '@nestjs/common';
import { CMSDriverController } from '../../controllers/CMS/CMS_driver.controller';
import { CMSDriverService } from '../../services/CMS/CMS_driver.service';
import { CompanyModule } from '../company.module';
import { AuthModule } from '../auth.module';
import { MasterDataModule } from '../master-data.module';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  imports: [AuthModule, CompanyModule, MasterDataModule],
  controllers: [CMSDriverController],
  providers: [CMSDriverService, RolesGuard],
  exports: [CMSDriverService],
})
export class CMSDriverModule {}
