import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CMSRevenueController } from '../../controllers/CMS/CMS_revenue.controller';
import { CMSRevenueService } from '../../services/CMS/CMS_revenue.service';
import { CmsPaymentContextService } from '../../services/CMS/cms-payment-context.service';
import { RevenueRepository } from '../../repositories/revenue.repository';
import { AuthModule } from '../auth.module';
import { CompanyModule } from '../company.module';
import { SalesModule } from '../sales.module';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TbPayment } from '../../entities/sales/payment.entity';
import { TbRefund } from '../../entities/sales/refund.entity';
import { TbTicket } from '../../entities/ticket.entity';
import { TbBooking } from '../../entities/sales/booking.entity';
import { TbTrip } from '../../entities/trip.entity';
import { TbRoad } from '../../entities/road.entity';
import { TbVehicle } from '../../entities/vehicle.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TbPayment,
      TbRefund,
      TbTicket,
      TbBooking,
      TbTrip,
      TbRoad,
      TbVehicle,
    ]),
    AuthModule,
    CompanyModule,
    SalesModule,
  ],
  controllers: [CMSRevenueController],
  providers: [
    CMSRevenueService,
    CmsPaymentContextService,
    RevenueRepository,
    RolesGuard,
  ],
  exports: [CMSRevenueService, RevenueRepository, CmsPaymentContextService],
})
export class CMSRevenueModule {}
