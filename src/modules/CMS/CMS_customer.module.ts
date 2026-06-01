import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CMSCustomerController } from '../../controllers/CMS/CMS_customer.controller';
import { CMSCustomerService } from '../../services/CMS/CMS_customer.service';
import { AuthModule } from '../auth.module';
import { CompanyModule } from '../company.module';
import { CustomerModule } from '../customer.module';
import { UserModule } from '../user.module';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TbPayment } from '../../entities/sales/payment.entity';
import { TbTicket } from '../../entities/ticket.entity';
import { TbBooking } from '../../entities/sales/booking.entity';
import { TbTrip } from '../../entities/trip.entity';
import { TbRoad } from '../../entities/road.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TbPayment,
      TbTicket,
      TbBooking,
      TbTrip,
      TbRoad,
    ]),
    AuthModule,
    CompanyModule,
    CustomerModule,
    UserModule,
  ],
  controllers: [CMSCustomerController],
  providers: [CMSCustomerService, RolesGuard],
  exports: [CMSCustomerService],
})
export class CMSCustomerModule {}
