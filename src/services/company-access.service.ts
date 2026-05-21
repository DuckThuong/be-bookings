import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TbCompany } from '../entities/company/company.entity';
import { TbRoad } from '../entities/road.entity';
import { TbTrip } from '../entities/trip.entity';
import { TbVerhical } from '../entities/verhical.entity';
import { TbDriver } from '../entities/driver.entity';
import { TbCompanyTrip } from '../entities/company/company-trip.entity';
import { TbSeat } from '../entities/seat.entity';
import { CompanyRepository } from '../repositories/company.repository';
import { RoadRepository } from '../repositories/road.repository';
import { TripRepository } from '../repositories/trip.repository';
import { VehicleRepository } from '../repositories/vehicle.repository';
import { DriverRepository } from '../repositories/driver.repository';
import { CompanyTripRepository } from '../repositories/company-trip.repository';
import { SeatRepository } from '../repositories/seat.repository';
import { CompanyErrorMessage } from '../assets/messages/company.message';
import { UserDecoratorDtoResponse, UserRole } from '../dtos/user/common.dto';

@Injectable()
export class CompanyAccessService {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly roadRepository: RoadRepository,
    private readonly tripRepository: TripRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly driverRepository: DriverRepository,
    private readonly companyTripRepository: CompanyTripRepository,
    private readonly seatRepository: SeatRepository,
  ) {}

  async assertCompanyAccess(
    user: UserDecoratorDtoResponse,
    companyId: number,
  ): Promise<TbCompany> {
    const company = await this.companyRepository.findCompanyById(companyId);
    if (!company) {
      throw new NotFoundException(CompanyErrorMessage.COMPANY_NOT_FOUND);
    }

    if (user.role === UserRole.ADMIN) {
      return company;
    }

    if (
      user.role === UserRole.OWNER &&
      company.userLeadId === user.id.toString()
    ) {
      return company;
    }

    throw new ForbiddenException(CompanyErrorMessage.FORBIDDEN);
  }

  async resolveCompanyIdForUser(
    user: UserDecoratorDtoResponse,
    companyId?: number,
  ): Promise<number> {
    if (user.role === UserRole.ADMIN) {
      if (companyId == null) {
        throw new BadRequestException(CompanyErrorMessage.COMPANY_ID_REQUIRED);
      }
      return (await this.assertCompanyAccess(user, companyId)).id;
    }

    const companies = await this.companyRepository.findCompaniesByUserLead(
      user.id.toString(),
    );
    const active = companies.find((c) => c.status === 'ACTIVE');
    if (!active) {
      throw new NotFoundException(CompanyErrorMessage.COMPANY_NOT_FOUND);
    }
    return active.id;
  }

  async assertRoadBelongsToCompany(
    companyId: number,
    roadId: number,
  ): Promise<TbRoad> {
    const road = await this.roadRepository.findById(roadId);
    if (!road || road.companyId !== companyId) {
      throw new NotFoundException(CompanyErrorMessage.ROAD_NOT_BELONG_COMPANY);
    }
    return road;
  }

  async assertTripBelongsToCompany(
    companyId: number,
    tripId: number,
  ): Promise<TbTrip> {
    const trip = await this.tripRepository.findById(tripId);
    if (!trip) {
      throw new NotFoundException(CompanyErrorMessage.TRIP_NOT_FOUND);
    }
    const road = await this.roadRepository.findById(trip.roadId);
    if (!road || road.companyId !== companyId) {
      throw new NotFoundException(CompanyErrorMessage.TRIP_NOT_BELONG_COMPANY);
    }
    return trip;
  }

  async assertVehicleBelongsToCompany(
    companyId: number,
    vehicleId: number,
  ): Promise<TbVerhical> {
    const vehicle = await this.vehicleRepository.findById(vehicleId);
    if (!vehicle || vehicle.companyId !== companyId) {
      throw new NotFoundException(
        CompanyErrorMessage.VEHICLE_NOT_BELONG_COMPANY,
      );
    }
    return vehicle;
  }

  async assertDriverBelongsToCompany(
    companyId: number,
    driverId: number,
  ): Promise<TbDriver> {
    const driver = await this.driverRepository.findById(driverId);
    if (!driver || driver.companyId !== companyId) {
      throw new NotFoundException(
        CompanyErrorMessage.DRIVER_NOT_BELONG_COMPANY,
      );
    }
    return driver;
  }

  async assertCompanyTripBelongsToCompany(
    companyId: number,
    companyTripId: number,
  ): Promise<TbCompanyTrip> {
    const companyTrip =
      await this.companyTripRepository.findById(companyTripId);
    if (!companyTrip || companyTrip.companyId !== companyId) {
      throw new NotFoundException(CompanyErrorMessage.COMPANY_TRIP_NOT_FOUND);
    }
    return companyTrip;
  }

  async assertSeatBelongsToCompany(
    companyId: number,
    seatId: number,
  ): Promise<TbSeat> {
    const seat = await this.seatRepository.findById(seatId);
    if (!seat) {
      throw new NotFoundException(CompanyErrorMessage.SEAT_NOT_FOUND);
    }
    await this.assertVehicleBelongsToCompany(companyId, seat.verhicalId);
    return seat;
  }
}
