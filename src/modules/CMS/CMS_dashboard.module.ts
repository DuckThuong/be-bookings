import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CMSDashboardController } from '../../controllers/CMS/CMS_dashboard.controller';
import { CMSDashboardService } from '../../services/CMS/CMS_dashboard.service';
import { DashboardRepository } from '../../repositories/dashboard.repository';
import { AuthModule } from '../auth.module';
import { CompanyModule } from '../company.module';
import { SalesModule } from '../sales.module';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TbPayment } from '../../entities/sales/payment.entity';
import { TbTicket } from '../../entities/ticket.entity';
import { TbVehicle } from '../../entities/vehicle.entity';
import { TbCompany } from '../../entities/company/company.entity';
import { TbBasicUser } from '../../entities/user/basic-user.entity';
import { TbBooking } from '../../entities/sales/booking.entity';
import { TbTrip } from '../../entities/trip.entity';
import { TbRoad } from '../../entities/road.entity';
import { TbCompanyTrip } from '../../entities/company/company-trip.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TbPayment,
      TbTicket,
      TbVehicle,
      TbCompany,
      TbBasicUser,
      TbBooking,
      TbTrip,
      TbRoad,
      TbCompanyTrip,
    ]),
    AuthModule,
    CompanyModule,
    SalesModule,
  ],
  controllers: [CMSDashboardController],
  providers: [CMSDashboardService, DashboardRepository, RolesGuard],
  exports: [CMSDashboardService],
})
export class CMSDashboardModule {}
