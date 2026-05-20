import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TbCompany } from '../entities/company/company.entity';
import { TbRoad } from '../entities/road.entity';
import { TbTrip } from '../entities/trip.entity';
import { TbCompanyTrip } from '../entities/company/company-trip.entity';
import { TbVerhical } from '../entities/verhical.entity';
import { TbDriver } from '../entities/driver.entity';
import { TbSeat } from '../entities/seat.entity';
import { TbTicket } from '../entities/ticket.entity';
import { TbBooking } from '../entities/sales/booking.entity';
import { TbPayment } from '../entities/sales/payment.entity';
import { TbRefund } from '../entities/sales/refund.entity';
import { ClientController } from '../controllers/client.controller';
import { ClientCatalogService } from '../services/client-catalog.service';
import { ClientAccountService } from '../services/client-account.service';
import { ClientEnrichmentService } from '../services/client-enrichment.service';
import { ClientCatalogRepository } from '../repositories/client-catalog.repository';
import { ClientAccountRepository } from '../repositories/client-account.repository';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuthModule } from './auth.module';
import { CompanyModule } from './company.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TbCompany,
      TbRoad,
      TbTrip,
      TbCompanyTrip,
      TbVerhical,
      TbDriver,
      TbSeat,
      TbTicket,
      TbBooking,
      TbPayment,
      TbRefund,
    ]),
    AuthModule,
    CompanyModule,
  ],
  controllers: [ClientController],
  providers: [
    ClientCatalogService,
    ClientAccountService,
    ClientEnrichmentService,
    ClientCatalogRepository,
    ClientAccountRepository,
    RolesGuard,
  ],
  exports: [ClientCatalogService, ClientAccountService],
})
export class ClientModule {}
