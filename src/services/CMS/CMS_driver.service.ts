import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { DriverService } from '../driver.service';
import { VehicleService } from '../vehicle.service';
import { CompanyTripService } from '../company-trip.service';
import { TripService } from '../trip.service';
import {
  CreateDriverPayloadDto,
  UpdateDriverPayloadDto,
  DriverResponseDto,
  CmsDriverDetailResponseDto,
  CmsDriverListResponseDto,
  CmsDriverEntityDto,
} from '../../dtos/CMS/CMS_driver.dto';
import {
  CompanyTripResponseDto,
  CmsTripResponseDto,
  CmsVerhicalEntityDto,
} from '../../dtos/CMS/CMS_verhical.dto';
import { CommonErrorMessage } from '../../assets/messages/common.message';
import { CmsDriverSuccessMessage } from '../../assets/messages/cms-driver.message';
import { TbDriver } from '../../entities/driver.entity';
import { TbVerhical } from '../../entities/verhical.entity';
import { TbCompanyTrip } from '../../entities/company/company-trip.entity';
import { TbTrip } from '../../entities/trip.entity';
import { UserDecoratorDtoResponse } from '../../dtos/user/common.dto';
import {
  CreateDriverDto,
  UpdateDriverDto,
} from '../../dtos/company/company.dto';
import { EntityStatus } from '../../assets/constants/company.constants';
import { generateEntityCode } from '../../common/helpers/common.helper';
import { CODE_PREFIX } from '../../assets/constants/company.constants';

@Injectable()
export class CMSDriverService {
  constructor(
    private readonly driverService: DriverService,
    private readonly vehicalService: VehicleService,
    private readonly companyTripService: CompanyTripService,
    private readonly tripService: TripService,
  ) {}

  public async getDriverById(
    user: UserDecoratorDtoResponse,
    id: number,
  ): Promise<CmsDriverDetailResponseDto> {
    const driver = await this.driverService.findOne(user, id);
    return this.buildDriverDetail(user, driver);
  }

  public async getAllDrivers(
    user: UserDecoratorDtoResponse,
    companyId?: number,
  ): Promise<CmsDriverListResponseDto> {
    const drivers = await this.driverService.findAll(user, companyId);
    const items = await Promise.all(
      drivers.map((d) => this.buildDriverDetail(user, d)),
    );
    return { items, total: items.length };
  }

  public async createDriver(
    payload: CreateDriverPayloadDto,
    user: UserDecoratorDtoResponse,
  ): Promise<DriverResponseDto> {
    try {
      const driver = await this.driverService.create(
        user,
        this.toCreateDriverDto(payload),
      );
      return this.toResponse(driver);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log('error: ', error);
      throw new HttpException(
        CommonErrorMessage.CATCH_ERROR.toString(),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async updateDriver(
    payload: UpdateDriverPayloadDto,
    user: UserDecoratorDtoResponse,
  ): Promise<DriverResponseDto> {
    try {
      const driver = await this.driverService.update(
        user,
        payload.id,
        this.toUpdateDriverDto(payload),
      );
      return this.toResponse(driver);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log('error: ', error);
      throw new HttpException(
        CommonErrorMessage.CATCH_ERROR.toString(),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async deleteDriver(
    user: UserDecoratorDtoResponse,
    id: number,
  ): Promise<{ message: string; driverId: number }> {
    try {
      await this.driverService.remove(user, id);
      return {
        message: CmsDriverSuccessMessage.DELETE_SUCCESS,
        driverId: id,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log('error: ', error);
      throw new HttpException(
        CommonErrorMessage.CATCH_ERROR.toString(),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private toCreateDriverDto(payload: CreateDriverPayloadDto): CreateDriverDto {
    return {
      name: payload.driverName,
      code:
        payload.driverCode?.trim() || generateEntityCode(CODE_PREFIX.DRIVER),
      verhicalId: payload.verhicalId,
      license: payload.license,
      phone: payload.phone,
      email: payload.email,
      description: payload.description,
      status: payload.driverStatus,
    };
  }

  private toUpdateDriverDto(payload: UpdateDriverPayloadDto): UpdateDriverDto {
    return {
      name: payload.driverName,
      verhicalId: payload.verhicalId,
      license: payload.license,
      phone: payload.phone,
      email: payload.email,
      description: payload.description,
      status: payload.driverStatus,
    };
  }

  private async buildDriverDetail(
    user: UserDecoratorDtoResponse,
    driver: TbDriver,
  ): Promise<CmsDriverDetailResponseDto> {
    const [verhical, companyTrips] = await Promise.all([
      this.loadVerhicalForDetail(user, driver.verhicalId),
      this.companyTripService.findByDriver(
        user,
        driver.companyId,
        driver.id,
      ),
    ]);

    const primaryCompanyTrip = this.pickPrimaryCompanyTrip(companyTrips);
    const trip = await this.loadTripForDetail(user, primaryCompanyTrip);

    return {
      driver: this.toCmsDriverEntity(driver),
      verhical,
      trip,
      companyTrip: primaryCompanyTrip
        ? this.toCompanyTripResponse(primaryCompanyTrip)
        : null,
      companyTrips: companyTrips.map((t) => this.toCompanyTripResponse(t)),
      verhicalId: String(driver.verhicalId),
      tripId: primaryCompanyTrip ? String(primaryCompanyTrip.tripId) : '',
      companyTripId: primaryCompanyTrip?.id,
    };
  }

  private pickPrimaryCompanyTrip(trips: TbCompanyTrip[]): TbCompanyTrip | null {
    if (!trips.length) {
      return null;
    }
    const active = trips.filter((t) => t.status === EntityStatus.ACTIVE);
    const pool = active.length ? active : trips;
    return [...pool].sort((a, b) => b.id - a.id)[0];
  }

  private async loadVerhicalForDetail(
    user: UserDecoratorDtoResponse,
    verhicalId: number,
  ): Promise<CmsVerhicalEntityDto | null> {
    try {
      const entity = await this.vehicalService.findOne(user, verhicalId);
      return this.toCmsVerhicalEntity(entity);
    } catch {
      return null;
    }
  }

  private async loadTripForDetail(
    user: UserDecoratorDtoResponse,
    companyTrip: TbCompanyTrip | null,
  ): Promise<CmsTripResponseDto | null> {
    if (!companyTrip) {
      return null;
    }
    try {
      const entity = await this.tripService.findOne(user, companyTrip.tripId);
      return this.toCmsTripResponse(entity);
    } catch {
      return null;
    }
  }

  private toCmsDriverEntity(driver: TbDriver): CmsDriverEntityDto {
    return {
      id: driver.id,
      code: driver.code,
      companyId: driver.companyId,
      verhicalId: driver.verhicalId,
      name: driver.name,
      license: driver.license,
      phone: driver.phone,
      email: driver.email,
      status: driver.status,
      description: driver.description ?? undefined,
      rate: Number(driver.rate),
      totalTurn: driver.totalTurn,
      createdAt: driver.createdAt?.toISOString?.() ?? String(driver.createdAt),
      updatedAt: driver.updatedAt?.toISOString?.() ?? String(driver.updatedAt),
    };
  }

  private toCmsVerhicalEntity(vehical: TbVerhical): CmsVerhicalEntityDto {
    return {
      id: vehical.id,
      companyId: vehical.companyId,
      code: vehical.code,
      name: vehical.name,
      type: vehical.type,
      status: vehical.status,
      schedule: vehical.schedule ?? undefined,
      description: vehical.description ?? undefined,
      image: vehical.image ?? undefined,
    };
  }

  private toCmsTripResponse(trip: TbTrip): CmsTripResponseDto {
    return {
      id: trip.id,
      code: trip.code,
      name: trip.name,
      roadId: trip.roadId,
      status: trip.status,
      description: trip.description ?? undefined,
    };
  }

  private toCompanyTripResponse(trip: TbCompanyTrip): CompanyTripResponseDto {
    return {
      id: trip.id,
      companyId: trip.companyId,
      tripId: trip.tripId,
      verhicalId: trip.verhicalId,
      driverId: trip.driverId,
      totalSeat: trip.totalSeat,
      totalSeatBooked: trip.totalSeatBooked,
      pricePerSeat: Number(trip.pricePerSeat),
      status: trip.status,
      description: trip.description,
      createdAt: trip.createdAt?.toISOString?.() ?? String(trip.createdAt),
      updatedAt: trip.updatedAt?.toISOString?.() ?? String(trip.updatedAt),
    };
  }

  private toResponse(driver: TbDriver): DriverResponseDto {
    return {
      id: String(driver.id),
      name: driver.name,
      code: driver.code,
      verhicalId: String(driver.verhicalId),
      license: driver.license,
      phone: driver.phone,
      email: driver.email,
      driverStatus: driver.status,
      description: driver.description ?? undefined,
      rate: Number(driver.rate),
      totalTurn: driver.totalTurn,
      createdAt: driver.createdAt?.toISOString?.() ?? new Date().toISOString(),
      updatedAt: driver.updatedAt?.toISOString?.() ?? new Date().toISOString(),
    };
  }
}
