import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyRegistrationController } from '../controllers/company-registration.controller';
import { CompanyRegistrationService } from '../services/company-registration.service';
import { CompanyRegistrationRepository } from '../repositories/company-registration.repository';
import { TbCompanyRegistration } from '../entities/company-registration.entity';
import { TbCompany } from '../entities/company/company.entity';
import { TbBasicUser } from '../entities/user/basic-user.entity';
import { TbInfoUser } from '../entities/user/info-user.entity';
import { CompanyRepository } from '../repositories/company.repository';
import { UserRepository } from '../repositories/user.repository';
import { CompanyModule } from './company.module';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuthModule } from './auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TbCompanyRegistration,
      TbCompany,
      TbBasicUser,
      TbInfoUser,
    ]),
    CompanyModule,
    AuthModule,
  ],
  controllers: [CompanyRegistrationController],
  providers: [
    CompanyRegistrationService,
    CompanyRegistrationRepository,
    CompanyRepository,
    UserRepository,
    RolesGuard,
  ],
  exports: [CompanyRegistrationService],
})
export class CompanyRegistrationModule {}
