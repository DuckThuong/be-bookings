import { Module } from '@nestjs/common';
import { CMSVerhicalController } from '../../controllers/CMS/CMS_verhical.controller';
import { CMSVerhicalService } from '../../services/CMS/CMS_verhical.service';
import { CompanyModule } from '../company.module';
import { AuthModule } from '../auth.module';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  imports: [AuthModule, CompanyModule],
  controllers: [CMSVerhicalController],
  providers: [CMSVerhicalService, RolesGuard],
  exports: [CMSVerhicalService],
})
export class CMSVerhicalModule {}
