import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TbCompany } from '../entities/company/company.entity';
import { TbRoad } from '../entities/road.entity';
import { TbTrip } from '../entities/trip.entity';
import { TbVerhical } from '../entities/verhical.entity';
import { TbDriver } from '../entities/driver.entity';
import { TbCompanyTrip } from '../entities/company/company-trip.entity';
import { TbSeat } from '../entities/seat.entity';
import { CompanyController } from '../controllers/company.controller';
import { CompanyService } from '../services/company.service';
import { CompanyRepository } from '../repositories/company.repository';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuthModule } from './auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TbCompany,
      TbRoad,
      TbTrip,
      TbVerhical,
      TbDriver,
      TbCompanyTrip,
      TbSeat,
    ]),
    AuthModule,
  ],
  controllers: [CompanyController],
  providers: [CompanyService, CompanyRepository, RolesGuard],
  exports: [CompanyService, CompanyRepository],
})
export class CompanyModule {}
