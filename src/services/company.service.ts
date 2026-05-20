import {
  ForbiddenException,
  HttpException,
  HttpStatus,
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
import {
  CODE_PREFIX,
  EntityStatus,
} from '../assets/constants/company.constants';
import { CompanyErrorMessage } from '../assets/messages/company.message';
import {
  generateEntityCode,
  validString,
} from '../common/helpers/common.helper';
import {
  CompanyOverviewDto,
  CreateCompanyDto,
  CreateCompanyTripDto,
  CreateDriverDto,
  CreateRoadDto,
  CreateSeatDto,
  CreateSeatsBatchDto,
  CreateTripDto,
  CreateVehicleDto,
  UpdateCompanyDto,
  UpdateCompanyTripDto,
  UpdateDriverDto,
  UpdateRoadDto,
  UpdateTripDto,
  UpdateVehicleDto,
} from '../dtos/company/company.dto';
import { UserDecoratorDtoResponse, UserRole } from '../dtos/user/common.dto';

@Injectable()
export class CompanyService {
  constructor(private readonly companyRepository: CompanyRepository) {}

  // ==================== Company CRUD ====================

  async createCompany(
    user: UserDecoratorDtoResponse,
    payload: CreateCompanyDto,
  ): Promise<TbCompany> {
    if (!validString(payload.companyName)) {
      throw new HttpException(
        CompanyErrorMessage.COMPANY_NAME_REQUIRED,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (user.role === UserRole.OWNER) {
      const existing = await this.companyRepository.findCompaniesByUserLead(
        user.userCode,
      );
      const active = existing.find((c) => c.status === EntityStatus.ACTIVE);
      if (active) {
        throw new HttpException(
          CompanyErrorMessage.COMPANY_ALREADY_EXISTS,
          HttpStatus.CONFLICT,
        );
      }
    }

    return this.companyRepository.saveCompany({
      companyName: payload.companyName.trim(),
      description: payload.description ?? undefined,
      userLeadId: user.userCode,
      code: generateEntityCode(CODE_PREFIX.COMPANY),
      status: payload.status ?? EntityStatus.ACTIVE,
    });
  }

  async getCompanies(user: UserDecoratorDtoResponse): Promise<TbCompany[]> {
    if (user.role === UserRole.ADMIN) {
      return this.companyRepository.findAllCompanies();
    }
    if (user.role === UserRole.OWNER) {
      return this.companyRepository.findCompaniesByUserLead(user.userCode);
    }
    throw new ForbiddenException(CompanyErrorMessage.FORBIDDEN);
  }

  async getMyCompany(user: UserDecoratorDtoResponse): Promise<TbCompany> {
    const companies = await this.companyRepository.findCompaniesByUserLead(
      user.userCode,
    );
    const active = companies.find((c) => c.status === EntityStatus.ACTIVE);
    if (!active) {
      throw new NotFoundException(CompanyErrorMessage.COMPANY_NOT_FOUND);
    }
    return active;
  }

  async getCompanyById(
    user: UserDecoratorDtoResponse,
    companyId: number,
  ): Promise<TbCompany> {
    return this.assertCompanyAccess(user, companyId);
  }

  async updateCompany(
    user: UserDecoratorDtoResponse,
    companyId: number,
    payload: UpdateCompanyDto,
  ): Promise<TbCompany> {
    await this.assertCompanyAccess(user, companyId);

    const update: Partial<TbCompany> = {};
    if (payload.companyName !== undefined) {
      update.companyName = payload.companyName.trim();
    }
    if (payload.description !== undefined) {
      update.description = payload.description;
    }
    if (payload.status !== undefined) {
      update.status = payload.status;
    }
    if (payload.userLeadId !== undefined && user.role === UserRole.ADMIN) {
      update.userLeadId = payload.userLeadId;
    }

    if (Object.keys(update).length > 0) {
      await this.companyRepository.updateCompany(companyId, update);
    }

    const updated = await this.companyRepository.findCompanyById(companyId);
    if (!updated) {
      throw new NotFoundException(CompanyErrorMessage.COMPANY_NOT_FOUND);
    }
    return updated;
  }

  async deleteCompany(
    user: UserDecoratorDtoResponse,
    companyId: number,
  ): Promise<{ message: string }> {
    await this.assertCompanyAccess(user, companyId);
    await this.companyRepository.updateCompany(companyId, {
      status: EntityStatus.INACTIVE,
    });
    return { message: 'Đã vô hiệu hóa nhà xe' };
  }

  async getCompanyOverview(
    user: UserDecoratorDtoResponse,
    companyId: number,
  ): Promise<CompanyOverviewDto> {
    await this.assertCompanyAccess(user, companyId);

    const [
      roadCount,
      tripCount,
      vehicleCount,
      driverCount,
      companyTripCount,
      seatCount,
    ] = await Promise.all([
      this.companyRepository.countRoadsByCompany(companyId),
      this.companyRepository.countTripsByCompany(companyId),
      this.companyRepository.countVehiclesByCompany(companyId),
      this.companyRepository.countDriversByCompany(companyId),
      this.companyRepository.countCompanyTripsByCompany(companyId),
      this.companyRepository.countSeatsByCompany(companyId),
    ]);

    return {
      roadCount,
      tripCount,
      vehicleCount,
      driverCount,
      companyTripCount,
      seatCount,
    };
  }

  // ==================== Road ====================

  async createRoad(
    user: UserDecoratorDtoResponse,
    companyId: number,
    payload: CreateRoadDto,
  ): Promise<TbRoad> {
    await this.assertCompanyAccess(user, companyId);
    return this.companyRepository.saveRoad({
      companyId,
      code: generateEntityCode(CODE_PREFIX.ROAD),
      name: payload.name,
      length: payload.length,
      type: payload.type,
      startPoint: payload.startPoint,
      endPoint: payload.endPoint,
      startTime: payload.startTime,
      endTime: payload.endTime,
      status: payload.status ?? EntityStatus.ACTIVE,
      totalTurn: 0,
    });
  }

  async getRoads(
    user: UserDecoratorDtoResponse,
    companyId: number,
  ): Promise<TbRoad[]> {
    await this.assertCompanyAccess(user, companyId);
    return this.companyRepository.findRoadsByCompany(companyId);
  }

  async getRoadById(
    user: UserDecoratorDtoResponse,
    companyId: number,
    roadId: number,
  ): Promise<TbRoad> {
    await this.assertCompanyAccess(user, companyId);
    return this.assertRoadBelongsToCompany(companyId, roadId);
  }

  async updateRoad(
    user: UserDecoratorDtoResponse,
    companyId: number,
    roadId: number,
    payload: UpdateRoadDto,
  ): Promise<TbRoad> {
    await this.assertRoadBelongsToCompany(companyId, roadId);
    await this.assertCompanyAccess(user, companyId);
    await this.companyRepository.updateRoad(roadId, payload);
    return this.assertRoadBelongsToCompany(companyId, roadId);
  }

  async deleteRoad(
    user: UserDecoratorDtoResponse,
    companyId: number,
    roadId: number,
  ): Promise<{ message: string }> {
    await this.assertCompanyAccess(user, companyId);
    await this.assertRoadBelongsToCompany(companyId, roadId);
    await this.companyRepository.updateRoad(roadId, {
      status: EntityStatus.INACTIVE,
    });
    return { message: 'Đã vô hiệu hóa tuyến đường' };
  }

  // ==================== Trip (mẫu chuyến) ====================

  async createTrip(
    user: UserDecoratorDtoResponse,
    companyId: number,
    payload: CreateTripDto,
  ): Promise<TbTrip> {
    await this.assertCompanyAccess(user, companyId);
    const road = await this.assertRoadBelongsToCompany(
      companyId,
      payload.roadId,
    );

    const trip = await this.companyRepository.saveTrip({
      code: generateEntityCode(CODE_PREFIX.TRIP),
      name: payload.name,
      roadId: payload.roadId,
      description: payload.description ?? undefined,
      status: payload.status ?? EntityStatus.ACTIVE,
    });

    await this.companyRepository.updateRoad(payload.roadId, {
      totalTurn: road.totalTurn + 1,
    });

    return trip;
  }

  async getTrips(
    user: UserDecoratorDtoResponse,
    companyId: number,
  ): Promise<TbTrip[]> {
    await this.assertCompanyAccess(user, companyId);
    return this.companyRepository.findTripsByCompany(companyId);
  }

  async getTripById(
    user: UserDecoratorDtoResponse,
    companyId: number,
    tripId: number,
  ): Promise<TbTrip> {
    await this.assertCompanyAccess(user, companyId);
    return this.assertTripBelongsToCompany(companyId, tripId);
  }

  async updateTrip(
    user: UserDecoratorDtoResponse,
    companyId: number,
    tripId: number,
    payload: UpdateTripDto,
  ): Promise<TbTrip> {
    await this.assertCompanyAccess(user, companyId);
    await this.assertTripBelongsToCompany(companyId, tripId);

    if (payload.roadId !== undefined) {
      await this.assertRoadBelongsToCompany(companyId, payload.roadId);
    }

    await this.companyRepository.updateTrip(tripId, payload);
    return this.assertTripBelongsToCompany(companyId, tripId);
  }

  async deleteTrip(
    user: UserDecoratorDtoResponse,
    companyId: number,
    tripId: number,
  ): Promise<{ message: string }> {
    await this.assertCompanyAccess(user, companyId);
    await this.assertTripBelongsToCompany(companyId, tripId);
    await this.companyRepository.updateTrip(tripId, {
      status: EntityStatus.INACTIVE,
    });
    return { message: 'Đã vô hiệu hóa chuyến xe' };
  }

  // ==================== Vehicle ====================

  async createVehicle(
    user: UserDecoratorDtoResponse,
    companyId: number,
    payload: CreateVehicleDto,
  ): Promise<TbVerhical> {
    await this.assertCompanyAccess(user, companyId);

    if (!validString(payload.code)) {
      throw new HttpException(
        CompanyErrorMessage.INVALID_REFERENCE,
        HttpStatus.BAD_REQUEST,
      );
    }

    const existing = await this.companyRepository.findVehicleByCode(
      payload.code.trim(),
    );
    if (existing) {
      throw new HttpException(
        CompanyErrorMessage.CODE_CONFLICT,
        HttpStatus.CONFLICT,
      );
    }

    return this.companyRepository.saveVehicle({
      companyId,
      code: payload.code.trim(),
      type: payload.type,
      name: payload.name,
      image: payload.image ?? undefined,
      schedule: payload.schedule ?? undefined,
      description: payload.description ?? undefined,
      status: payload.status ?? EntityStatus.ACTIVE,
    });
  }

  async getVehicles(
    user: UserDecoratorDtoResponse,
    companyId: number,
  ): Promise<TbVerhical[]> {
    await this.assertCompanyAccess(user, companyId);
    return this.companyRepository.findVehiclesByCompany(companyId);
  }

  async getVehicleById(
    user: UserDecoratorDtoResponse,
    companyId: number,
    vehicleId: number,
  ): Promise<TbVerhical> {
    await this.assertCompanyAccess(user, companyId);
    return this.assertVehicleBelongsToCompany(companyId, vehicleId);
  }

  async updateVehicle(
    user: UserDecoratorDtoResponse,
    companyId: number,
    vehicleId: number,
    payload: UpdateVehicleDto,
  ): Promise<TbVerhical> {
    await this.assertCompanyAccess(user, companyId);
    await this.assertVehicleBelongsToCompany(companyId, vehicleId);

    if (payload.code) {
      const existing = await this.companyRepository.findVehicleByCode(
        payload.code.trim(),
      );
      if (existing && existing.id !== vehicleId) {
        throw new HttpException(
          CompanyErrorMessage.CODE_CONFLICT,
          HttpStatus.CONFLICT,
        );
      }
    }

    await this.companyRepository.updateVehicle(vehicleId, payload);
    return this.assertVehicleBelongsToCompany(companyId, vehicleId);
  }

  async deleteVehicle(
    user: UserDecoratorDtoResponse,
    companyId: number,
    vehicleId: number,
  ): Promise<{ message: string }> {
    await this.assertCompanyAccess(user, companyId);
    await this.assertVehicleBelongsToCompany(companyId, vehicleId);
    await this.companyRepository.updateVehicle(vehicleId, {
      status: EntityStatus.INACTIVE,
    });
    return { message: 'Đã vô hiệu hóa phương tiện' };
  }

  // ==================== Driver ====================

  async createDriver(
    user: UserDecoratorDtoResponse,
    companyId: number,
    payload: CreateDriverDto,
  ): Promise<TbDriver> {
    await this.assertCompanyAccess(user, companyId);
    await this.assertVehicleBelongsToCompany(companyId, payload.verhicalId);

    return this.companyRepository.saveDriver({
      companyId,
      verhicalId: payload.verhicalId,
      code: generateEntityCode(CODE_PREFIX.DRIVER),
      name: payload.name,
      license: payload.license,
      phone: payload.phone,
      email: payload.email,
      description: payload.description ?? undefined,
      status: payload.status ?? EntityStatus.ACTIVE,
      rate: 0,
      totalTurn: 0,
    });
  }

  async getDrivers(
    user: UserDecoratorDtoResponse,
    companyId: number,
  ): Promise<TbDriver[]> {
    await this.assertCompanyAccess(user, companyId);
    return this.companyRepository.findDriversByCompany(companyId);
  }

  async getDriverById(
    user: UserDecoratorDtoResponse,
    companyId: number,
    driverId: number,
  ): Promise<TbDriver> {
    await this.assertCompanyAccess(user, companyId);
    return this.assertDriverBelongsToCompany(companyId, driverId);
  }

  async updateDriver(
    user: UserDecoratorDtoResponse,
    companyId: number,
    driverId: number,
    payload: UpdateDriverDto,
  ): Promise<TbDriver> {
    await this.assertCompanyAccess(user, companyId);
    await this.assertDriverBelongsToCompany(companyId, driverId);

    if (payload.verhicalId !== undefined) {
      await this.assertVehicleBelongsToCompany(companyId, payload.verhicalId);
    }

    await this.companyRepository.updateDriver(driverId, payload);
    return this.assertDriverBelongsToCompany(companyId, driverId);
  }

  async deleteDriver(
    user: UserDecoratorDtoResponse,
    companyId: number,
    driverId: number,
  ): Promise<{ message: string }> {
    await this.assertCompanyAccess(user, companyId);
    await this.assertDriverBelongsToCompany(companyId, driverId);
    await this.companyRepository.updateDriver(driverId, {
      status: EntityStatus.INACTIVE,
    });
    return { message: 'Đã vô hiệu hóa tài xế' };
  }

  // ==================== Company trip (chuyến khai thác) ====================

  async createCompanyTrip(
    user: UserDecoratorDtoResponse,
    companyId: number,
    payload: CreateCompanyTripDto,
  ): Promise<TbCompanyTrip> {
    await this.assertCompanyAccess(user, companyId);
    await this.assertTripBelongsToCompany(companyId, payload.tripId);
    await this.assertVehicleBelongsToCompany(companyId, payload.verhicalId);
    await this.assertDriverBelongsToCompany(companyId, payload.driverId);

    return this.companyRepository.saveCompanyTrip({
      companyId,
      tripId: payload.tripId,
      verhicalId: payload.verhicalId,
      driverId: payload.driverId,
      description: payload.description ?? '',
      totalSeat: payload.totalSeat,
      totalSeatBooked: 0,
      totalPrice: 0,
      pricePerSeat: payload.pricePerSeat,
      status: payload.status ?? EntityStatus.ACTIVE,
    });
  }

  async getCompanyTrips(
    user: UserDecoratorDtoResponse,
    companyId: number,
  ): Promise<TbCompanyTrip[]> {
    await this.assertCompanyAccess(user, companyId);
    return this.companyRepository.findCompanyTripsByCompany(companyId);
  }

  async getCompanyTripById(
    user: UserDecoratorDtoResponse,
    companyId: number,
    companyTripId: number,
  ): Promise<TbCompanyTrip> {
    await this.assertCompanyAccess(user, companyId);
    return this.assertCompanyTripBelongsToCompany(companyId, companyTripId);
  }

  async updateCompanyTrip(
    user: UserDecoratorDtoResponse,
    companyId: number,
    companyTripId: number,
    payload: UpdateCompanyTripDto,
  ): Promise<TbCompanyTrip> {
    await this.assertCompanyAccess(user, companyId);
    await this.assertCompanyTripBelongsToCompany(companyId, companyTripId);

    if (payload.tripId !== undefined) {
      await this.assertTripBelongsToCompany(companyId, payload.tripId);
    }
    if (payload.verhicalId !== undefined) {
      await this.assertVehicleBelongsToCompany(companyId, payload.verhicalId);
    }
    if (payload.driverId !== undefined) {
      await this.assertDriverBelongsToCompany(companyId, payload.driverId);
    }

    await this.companyRepository.updateCompanyTrip(companyTripId, payload);
    return this.assertCompanyTripBelongsToCompany(companyId, companyTripId);
  }

  async deleteCompanyTrip(
    user: UserDecoratorDtoResponse,
    companyId: number,
    companyTripId: number,
  ): Promise<{ message: string }> {
    await this.assertCompanyAccess(user, companyId);
    await this.assertCompanyTripBelongsToCompany(companyId, companyTripId);
    await this.companyRepository.updateCompanyTrip(companyTripId, {
      status: EntityStatus.INACTIVE,
    });
    return { message: 'Đã vô hiệu hóa chuyến nhà xe' };
  }

  // ==================== Seat ====================

  async createSeat(
    user: UserDecoratorDtoResponse,
    companyId: number,
    vehicleId: number,
    payload: CreateSeatDto,
  ): Promise<TbSeat> {
    await this.assertVehicleBelongsToCompany(companyId, vehicleId);
    await this.assertCompanyAccess(user, companyId);

    return this.companyRepository.saveSeat({
      verhicalId: vehicleId,
      code: generateEntityCode(CODE_PREFIX.SEAT),
      name: payload.name,
      index: payload.index,
      type: payload.type,
      status: payload.status ?? EntityStatus.ACTIVE,
      description: payload.description ?? undefined,
    });
  }

  async createSeatsBatch(
    user: UserDecoratorDtoResponse,
    companyId: number,
    vehicleId: number,
    payload: CreateSeatsBatchDto,
  ): Promise<TbSeat[]> {
    await this.assertVehicleBelongsToCompany(companyId, vehicleId);
    await this.assertCompanyAccess(user, companyId);

    if (!payload.seats?.length) {
      throw new HttpException(
        CompanyErrorMessage.INVALID_REFERENCE,
        HttpStatus.BAD_REQUEST,
      );
    }

    const seats = payload.seats.map((seat) => ({
      verhicalId: vehicleId,
      code: generateEntityCode(CODE_PREFIX.SEAT),
      name: seat.name,
      index: seat.index,
      type: seat.type,
      status: seat.status ?? EntityStatus.ACTIVE,
      description: seat.description ?? null,
    }));

    return this.companyRepository.saveSeats(seats as Partial<TbSeat>[]);
  }

  async getSeats(
    user: UserDecoratorDtoResponse,
    companyId: number,
    vehicleId: number,
  ): Promise<TbSeat[]> {
    await this.assertCompanyAccess(user, companyId);
    await this.assertVehicleBelongsToCompany(companyId, vehicleId);
    return this.companyRepository.findSeatsByVehicle(vehicleId);
  }

  // ==================== Access helpers ====================

  private async assertCompanyAccess(
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

    if (user.role === UserRole.OWNER && company.userLeadId === user.userCode) {
      return company;
    }

    throw new ForbiddenException(CompanyErrorMessage.FORBIDDEN);
  }

  private async assertRoadBelongsToCompany(
    companyId: number,
    roadId: number,
  ): Promise<TbRoad> {
    const road = await this.companyRepository.findRoadById(roadId);
    if (!road || road.companyId !== companyId) {
      throw new NotFoundException(CompanyErrorMessage.ROAD_NOT_BELONG_COMPANY);
    }
    return road;
  }

  private async assertTripBelongsToCompany(
    companyId: number,
    tripId: number,
  ): Promise<TbTrip> {
    const trip = await this.companyRepository.findTripById(tripId);
    if (!trip) {
      throw new NotFoundException(CompanyErrorMessage.TRIP_NOT_FOUND);
    }
    const road = await this.companyRepository.findRoadById(trip.roadId);
    if (!road || road.companyId !== companyId) {
      throw new NotFoundException(CompanyErrorMessage.TRIP_NOT_BELONG_COMPANY);
    }
    return trip;
  }

  private async assertVehicleBelongsToCompany(
    companyId: number,
    vehicleId: number,
  ): Promise<TbVerhical> {
    const vehicle = await this.companyRepository.findVehicleById(vehicleId);
    if (!vehicle || vehicle.companyId !== companyId) {
      throw new NotFoundException(
        CompanyErrorMessage.VEHICLE_NOT_BELONG_COMPANY,
      );
    }
    return vehicle;
  }

  private async assertDriverBelongsToCompany(
    companyId: number,
    driverId: number,
  ): Promise<TbDriver> {
    const driver = await this.companyRepository.findDriverById(driverId);
    if (!driver || driver.companyId !== companyId) {
      throw new NotFoundException(
        CompanyErrorMessage.DRIVER_NOT_BELONG_COMPANY,
      );
    }
    return driver;
  }

  private async assertCompanyTripBelongsToCompany(
    companyId: number,
    companyTripId: number,
  ): Promise<TbCompanyTrip> {
    const companyTrip =
      await this.companyRepository.findCompanyTripById(companyTripId);
    if (!companyTrip || companyTrip.companyId !== companyId) {
      throw new NotFoundException(CompanyErrorMessage.COMPANY_TRIP_NOT_FOUND);
    }
    return companyTrip;
  }
}
