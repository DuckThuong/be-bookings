import { Module } from '@nestjs/common';
import { CMSReportController } from '../../controllers/CMS/CMS_report.controller';
import { CMSReportService } from '../../services/CMS/CMS_report.service';
import { RevenueRepository } from '../../repositories/revenue.repository';
import { AuthModule } from '../auth.module';
import { CompanyModule } from '../company.module';
import { SalesModule } from '../sales.module';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CMSRevenueModule } from './CMS_revenue.module';

@Module({
  imports: [AuthModule, CompanyModule, SalesModule, CMSRevenueModule],
  controllers: [CMSReportController],
  providers: [CMSReportService, RolesGuard],
  exports: [CMSReportService],
})
export class CMSReportModule {}
