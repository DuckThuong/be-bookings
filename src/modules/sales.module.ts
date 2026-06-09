import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TbPayment } from '../entities/sales/payment.entity';
import { TbRefund } from '../entities/sales/refund.entity';
import { TbBooking } from '../entities/sales/booking.entity';
import { TbCompanyStat } from '../entities/sales/company-stat.entity';
import { TbTripStat } from '../entities/sales/trip-stat.entity';
import { TbCommission } from '../entities/sales/commission.entity';
import { TbSettlement } from '../entities/sales/settlement.entity';
import { TbPromotionUsage } from '../entities/sales/promotion-usage.entity';
import { BookingController } from '../controllers/sales/booking.controller';
import { PaymentController } from '../controllers/sales/payment.controller';
import { RefundController } from '../controllers/sales/refund.controller';
import { CommissionController } from '../controllers/sales/commission.controller';
import { SettlementController } from '../controllers/sales/settlement.controller';
import { CompanyStatController } from '../controllers/sales/company-stat.controller';
import { TripStatController } from '../controllers/sales/trip-stat.controller';
import { PromotionUsageController } from '../controllers/sales/promotion-usage.controller';
import { BookingService } from '../services/sales/booking.service';
import { PaymentService } from '../services/sales/payment.service';
import { RefundService } from '../services/sales/refund.service';
import { CommissionService } from '../services/sales/commission.service';
import { SettlementService } from '../services/sales/settlement.service';
import { CompanyStatService } from '../services/sales/company-stat.service';
import { TripStatService } from '../services/sales/trip-stat.service';
import { PromotionUsageService } from '../services/sales/promotion-usage.service';
import { PaymentRepository } from '../repositories/sales/payment.repository';
import { RefundRepository } from '../repositories/sales/refund.repository';
import { BookingRepository } from '../repositories/sales/booking.repository';
import { CommissionRepository } from '../repositories/sales/commission.repository';
import { SettlementRepository } from '../repositories/sales/settlement.repository';
import { CompanyStatRepository } from '../repositories/sales/company-stat.repository';
import { TripStatRepository } from '../repositories/sales/trip-stat.repository';
import { PromotionUsageRepository } from '../repositories/sales/promotion-usage.repository';
import { RolesGuard } from '../common/guards/roles.guard';
import { CompanyModule } from './company.module';
import { AuthModule } from './auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TbPayment,
      TbRefund,
      TbBooking,
      TbCompanyStat,
      TbTripStat,
      TbCommission,
      TbSettlement,
      TbPromotionUsage,
    ]),
    AuthModule,
    CompanyModule,
  ],
  controllers: [
    BookingController,
    PaymentController,
    RefundController,
    CommissionController,
    SettlementController,
    CompanyStatController,
    TripStatController,
    PromotionUsageController,
  ],
  providers: [
    BookingService,
    PaymentService,
    RefundService,
    CommissionService,
    SettlementService,
    CompanyStatService,
    TripStatService,
    PromotionUsageService,
    PaymentRepository,
    RefundRepository,
    BookingRepository,
    CommissionRepository,
    SettlementRepository,
    CompanyStatRepository,
    TripStatRepository,
    PromotionUsageRepository,
    RolesGuard,
  ],
  exports: [
    BookingService,
    PaymentService,
    RefundService,
    SettlementService,
    CompanyStatService,
    BookingRepository,
    PaymentRepository,
    CommissionRepository,
    TypeOrmModule,
  ],
})
export class SalesModule {}
