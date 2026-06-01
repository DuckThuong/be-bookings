import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TbCompany } from '../entities/company/company.entity';
import { TbRoad } from '../entities/road.entity';
import { TbTrip } from '../entities/trip.entity';
import { TbVehicle } from '../entities/vehicle.entity';
import { TbDriver } from '../entities/driver.entity';
import { TbSeat } from '../entities/seat.entity';
import { TbTicket } from '../entities/ticket.entity';
import { CompanyController } from '../controllers/company.controller';
import { RoadController } from '../controllers/road.controller';
import { TripController } from '../controllers/trip.controller';
import { VehicleController } from '../controllers/vehicle.controller';
import { DriverController } from '../controllers/driver.controller';
import { SeatController } from '../controllers/seat.controller';
import { TicketController } from '../controllers/ticket.controller';
import { CompanyService } from '../services/company.service';
import { RoadService } from '../services/road.service';
import { TripService } from '../services/trip.service';
import { VehicleService } from '../services/vehicle.service';
import { DriverService } from '../services/driver.service';
import { SeatService } from '../services/seat.service';
import { TicketService } from '../services/ticket.service';
import { CompanyAccessService } from '../services/company-access.service';
import { CompanyRepository } from '../repositories/company.repository';
import { RoadRepository } from '../repositories/road.repository';
import { TripRepository } from '../repositories/trip.repository';
import { VehicleRepository } from '../repositories/vehicle.repository';
import { DriverRepository } from '../repositories/driver.repository';
import { SeatRepository } from '../repositories/seat.repository';
import { TicketRepository } from '../repositories/ticket.repository';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuthModule } from './auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TbCompany,
      TbRoad,
      TbTrip,
      TbVehicle,
      TbDriver,
      TbSeat,
      TbTicket,
    ]),
    AuthModule,
  ],
  controllers: [
    CompanyController,
    RoadController,
    TripController,
    VehicleController,
    DriverController,
    SeatController,
    TicketController,
  ],
  providers: [
    CompanyService,
    RoadService,
    TripService,
    VehicleService,
    DriverService,
    SeatService,
    TicketService,
    CompanyAccessService,
    CompanyRepository,
    RoadRepository,
    TripRepository,
    VehicleRepository,
    DriverRepository,
    SeatRepository,
    TicketRepository,
    RolesGuard,
  ],
  exports: [
    CompanyService,
    CompanyAccessService,
    RoadService,
    TripService,
    VehicleService,
    DriverService,
    SeatService,
    TicketService,
    CompanyRepository,
    TripRepository,
    SeatRepository,
    TicketRepository,
    TypeOrmModule,
  ],
})
export class CompanyModule {}
