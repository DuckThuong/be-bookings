import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { TbCompany } from '../entities/company/company.entity';
import { TbRoad } from '../entities/road.entity';
import { TbTrip } from '../entities/trip.entity';
import { TbVehicle } from '../entities/vehicle.entity';
import { TbDriver } from '../entities/driver.entity';
import { TbSeat } from '../entities/seat.entity';
import { CompanyRepository } from '../repositories/company.repository';
import { RoadRepository } from '../repositories/road.repository';
import { TripRepository } from '../repositories/trip.repository';
import { VehicleRepository } from '../repositories/vehicle.repository';
import { DriverRepository } from '../repositories/driver.repository';
import { SeatRepository } from '../repositories/seat.repository';
import { EntityStatus } from '../assets/constants/company.constants';
import { CompanyErrorMessage } from '../assets/messages/company.message';
import { CmsTripValidationMessage } from '../assets/messages/cms-trip.message';
import { UserDecoratorDtoResponse, UserRole } from '../dtos/user/common.dto';
import { CmsRoadValidationMessage } from '../assets/messages/cms-road.message';
import { DashboardScope } from '../common/helpers/dashboard-scope.helper';

@Injectable()
export class CompanyAccessService {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly roadRepository: RoadRepository,
    private readonly tripRepository: TripRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly driverRepository: DriverRepository,
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

    if (user.role === UserRole.OWNER && company.userLeadId === user.id) {
      return company;
    }

    throw new ForbiddenException(CompanyErrorMessage.FORBIDDEN);
  }

  /**
   * Phạm vi dashboard: admin = toàn hệ thống (hoặc 1 company nếu truyền companyId),
   * owner = chỉ nhà xe của user.
   */
  async resolveDashboardScope(
    user: UserDecoratorDtoResponse,
    companyId?: number,
  ): Promise<DashboardScope> {
    if (user.role === UserRole.ADMIN) {
      if (companyId != null) {
        await this.assertCompanyAccess(user, companyId);
        return { type: 'platform', companyId };
      }
      return { type: 'platform' };
    }

    if (user.role === UserRole.OWNER) {
      const ownerCompanyId = await this.resolveCompanyIdForUser(user);
      if (companyId != null && companyId !== ownerCompanyId) {
        throw new ForbiddenException(CompanyErrorMessage.FORBIDDEN);
      }
      return { type: 'company', companyId: ownerCompanyId };
    }

    throw new ForbiddenException(CompanyErrorMessage.FORBIDDEN);
  }

  isPlatformScope(scope: DashboardScope): boolean {
    return scope.type === 'platform' && scope.companyId == null;
  }

  async resolveCompanyIdForUser(
    user: UserDecoratorDtoResponse,
  ): Promise<number> {
    if (user.role === UserRole.ADMIN) {
      throw new UnauthorizedException(CmsRoadValidationMessage.NO_PERMISSION);
    }

    const companies = await this.companyRepository.findCompaniesByUserLead(
      user.id.toString(),
    );
    console.log('companies', companies);
    const active = companies.find((c) => c.status == EntityStatus.ACTIVE);
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
    if (!road) {
      throw new NotFoundException(CompanyErrorMessage.ROAD_NOT_FOUND);
    }
    if (road.companyId !== companyId) {
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
  ): Promise<TbVehicle> {
    const vehicle = await this.vehicleRepository.findById(vehicleId);
    if (!vehicle) {
      throw new NotFoundException(CompanyErrorMessage.VEHICLE_NOT_FOUND);
    }
    if (vehicle.companyId !== companyId) {
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
    if (!driver) {
      throw new NotFoundException(CompanyErrorMessage.DRIVER_NOT_FOUND);
    }
    if (driver.company.id !== companyId) {
      throw new NotFoundException(
        CompanyErrorMessage.DRIVER_NOT_BELONG_COMPANY,
      );
    }
    return driver;
  }

  async assertSeatBelongsToCompany(
    companyId: number,
    seatId: number,
  ): Promise<TbSeat> {
    const seat = await this.seatRepository.findById(seatId);
    if (!seat) {
      throw new NotFoundException(CompanyErrorMessage.SEAT_NOT_FOUND);
    }
    await this.assertVehicleBelongsToCompany(companyId, seat.vehicleId);
    return seat;
  }

  /** Resolve tuyến theo mã (road.code) hoặc tên (road.name) trong phạm vi nhà xe */
  async resolveRoadByRouteKey(
    companyId: number,
    routeKey: string,
  ): Promise<TbRoad> {
    const key = routeKey?.trim();
    if (!key) {
      throw new BadRequestException(CmsTripValidationMessage.ROUTE_EMPTY);
    }
    const byCode = await this.roadRepository.findByCodeAndCompany(
      key,
      companyId,
    );
    if (byCode) {
      return byCode;
    }
    const byName = await this.roadRepository.findByNameAndCompany(
      key,
      companyId,
    );
    if (byName) {
      return byName;
    }
    throw new BadRequestException(CmsTripValidationMessage.ROUTE_NOT_FOUND);
  }

  async resolveVehicleByCode(
    companyId: number,
    vehicleCode: string,
  ): Promise<TbVehicle> {
    const code = vehicleCode?.trim();
    if (!code) {
      throw new BadRequestException(CmsTripValidationMessage.VEHICLE_EMPTY);
    }
    const vehicle = await this.vehicleRepository.findByCode(code);
    if (!vehicle) {
      throw new BadRequestException(CmsTripValidationMessage.VEHICLE_NOT_FOUND);
    }
    if (vehicle.companyId !== companyId) {
      throw new BadRequestException(
        CmsTripValidationMessage.VEHICLE_NOT_BELONG_COMPANY,
      );
    }
    return vehicle;
  }

  async resolveDriverByCode(
    companyId: number,
    driverCode: string,
  ): Promise<TbDriver> {
    const code = driverCode?.trim();
    if (!code) {
      throw new BadRequestException(CmsTripValidationMessage.DRIVER_EMPTY);
    }
    const driver = await this.driverRepository.findByCode(code);
    if (!driver) {
      throw new BadRequestException(CmsTripValidationMessage.DRIVER_NOT_FOUND);
    }
    if (driver.company.id !== companyId) {
      throw new BadRequestException(
        CmsTripValidationMessage.DRIVER_NOT_BELONG_COMPANY,
      );
    }
    return driver;
  }
}
