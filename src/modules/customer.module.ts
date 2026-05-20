import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TbTicket } from '../entities/ticket.entity';
import { TbBooking } from '../entities/sales/booking.entity';
import { TbPayment } from '../entities/sales/payment.entity';
import { TbRefund } from '../entities/sales/refund.entity';
import { CustomerController } from '../controllers/customer.controller';
import { CustomerService } from '../services/customer.service';
import { CustomerRepository } from '../repositories/customer.repository';
import { RolesGuard } from '../common/guards/roles.guard';
import { CompanyModule } from './company.module';
import { UserModule } from './user.module';
import { AuthModule } from './auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TbTicket, TbBooking, TbPayment, TbRefund]),
    AuthModule,
    CompanyModule,
    UserModule,
  ],
  controllers: [CustomerController],
  providers: [CustomerService, CustomerRepository, RolesGuard],
  exports: [CustomerService],
})
export class CustomerModule {}
