import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { TripService } from '../trip.service';
import { RoadService } from '../road.service';
import { CompanyTripService } from '../company-trip.service';
import { VehicleService } from '../vehicle.service';
import { DriverService } from '../driver.service';
import {
  CreateTripPayloadDto,
  UpdateTripPayloadDto,
  TripResponseDto,
  CmsTripDetailResponseDto,
  CmsTripListResponseDto,
  CmsTripEntityDto,
  CmsRoadResponseDto,
} from '../../dtos/CMS/CMS_trip.dto';
import {
  CompanyTripResponseDto,
  CmsDriverResponseDto,
  CmsVerhicalEntityDto,
} from '../../dtos/CMS/CMS_verhical.dto';
import { CommonErrorMessage } from '../../assets/messages/common.message';
import { CmsTripSuccessMessage } from '../../assets/messages/cms-trip.message';
import { TbTrip } from '../../entities/trip.entity';
import { TbRoad } from '../../entities/road.entity';
import { TbCompanyTrip } from '../../entities/company/company-trip.entity';
import { TbVerhical } from '../../entities/verhical.entity';
import { TbDriver } from '../../entities/driver.entity';
import { UserDecoratorDtoResponse } from '../../dtos/user/common.dto';
import {
  CreateTripDto,
  UpdateTripDto,
} from '../../dtos/company/company.dto';
import { EntityStatus } from '../../assets/constants/company.constants';
import { generateEntityCode } from '../../common/helpers/common.helper';
import { CODE_PREFIX } from '../../assets/constants/company.constants';

@Injectable()
export class CMSTripService {
  constructor(
    private readonly tripService: TripService,
    private readonly roadService: RoadService,
    private readonly companyTripService: CompanyTripService,
    private readonly vehicalService: VehicleService,
    private readonly driverService: DriverService,
  ) {}

  public async getTripById(
    user: UserDecoratorDtoResponse,
    id: number,
  ): Promise<CmsTripDetailResponseDto> {
    const trip = await this.tripService.findOne(user, id);
    return this.buildTripDetail(user, trip);
  }

  public async getAllTrips(
    user: UserDecoratorDtoResponse,
    companyId?: number,
    roadId?: number,
  ): Promise<CmsTripListResponseDto> {
    const trips = roadId
      ? await this.tripService.findByRoad(user, roadId)
      : await this.tripService.findAll(user, companyId);

    const items = await Promise.all(
      trips.map((t) => this.buildTripDetail(user, t)),
    );
    return { items, total: items.length };
  }

  public async createTrip(
    payload: CreateTripPayloadDto,
    user: UserDecoratorDtoResponse,
  ): Promise<TripResponseDto> {
    try {
      const trip = await this.tripService.create(
        user,
        this.toCreateTripDto(payload),
      );
      return this.toResponse(trip);
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

  public async updateTrip(
    payload: UpdateTripPayloadDto,
    user: UserDecoratorDtoResponse,
  ): Promise<TripResponseDto> {
    try {
      const trip = await this.tripService.update(
        user,
        payload.id,
        this.toUpdateTripDto(payload),
      );
      return this.toResponse(trip);
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

  public async deleteTrip(
    user: UserDecoratorDtoResponse,
    id: number,
  ): Promise<{ message: string; tripId: number }> {
    try {
      await this.tripService.remove(user, id);
      return {
        message: CmsTripSuccessMessage.DELETE_SUCCESS,
        tripId: id,
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

  private toCreateTripDto(payload: CreateTripPayloadDto): CreateTripDto {
    return {
      name: payload.tripName,
      code: payload.tripCode?.trim() || generateEntityCode(CODE_PREFIX.TRIP),
      roadId: payload.roadId,
      description: payload.description,
      status: payload.tripStatus,
    };
  }

  private toUpdateTripDto(payload: UpdateTripPayloadDto): UpdateTripDto {
    return {
      name: payload.tripName,
      roadId: payload.roadId,
      description: payload.description,
      status: payload.tripStatus,
    };
  }

  private async buildTripDetail(
    user: UserDecoratorDtoResponse,
    trip: TbTrip,
  ): Promise<CmsTripDetailResponseDto> {
    const road = await this.loadRoadForDetail(user, trip.roadId);
    const companyId = road?.companyId;
    const companyTrips = companyId
      ? await this.companyTripService.findByTrip(user, companyId, trip.id)
      : [];

    const primaryCompanyTrip = this.pickPrimaryCompanyTrip(companyTrips);
    const [verhical, driver] = await Promise.all([
      this.loadVerhicalForDetail(user, primaryCompanyTrip),
      this.loadDriverForDetail(user, primaryCompanyTrip),
    ]);

    return {
      trip: this.toCmsTripEntity(trip),
      road,
      verhical,
      driver,
      companyTrip: primaryCompanyTrip
        ? this.toCompanyTripResponse(primaryCompanyTrip)
        : null,
      companyTrips: companyTrips.map((t) => this.toCompanyTripResponse(t)),
      roadId: String(trip.roadId),
      verhicalId: primaryCompanyTrip
        ? String(primaryCompanyTrip.verhicalId)
        : '',
      driverId: primaryCompanyTrip
        ? String(primaryCompanyTrip.driverId)
        : '',
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

  private async loadRoadForDetail(
    user: UserDecoratorDtoResponse,
    roadId: number,
  ): Promise<CmsRoadResponseDto | null> {
    try {
      const entity = await this.roadService.findOne(user, roadId);
      return this.toCmsRoadResponse(entity);
    } catch {
      return null;
    }
  }

  private async loadVerhicalForDetail(
    user: UserDecoratorDtoResponse,
    companyTrip: TbCompanyTrip | null,
  ): Promise<CmsVerhicalEntityDto | null> {
    if (!companyTrip) {
      return null;
    }
    try {
      const entity = await this.vehicalService.findOne(
        user,
        companyTrip.verhicalId,
      );
      return this.toCmsVerhicalEntity(entity);
    } catch {
      return null;
    }
  }

  private async loadDriverForDetail(
    user: UserDecoratorDtoResponse,
    companyTrip: TbCompanyTrip | null,
  ): Promise<CmsDriverResponseDto | null> {
    if (!companyTrip) {
      return null;
    }
    try {
      const entity = await this.driverService.findOne(
        user,
        companyTrip.driverId,
      );
      return this.toCmsDriverResponse(entity);
    } catch {
      return null;
    }
  }

  private toCmsTripEntity(trip: TbTrip): CmsTripEntityDto {
    return {
      id: trip.id,
      code: trip.code,
      name: trip.name,
      roadId: trip.roadId,
      status: trip.status,
      description: trip.description ?? undefined,
    };
  }

  private toCmsRoadResponse(road: TbRoad): CmsRoadResponseDto {
    return {
      id: road.id,
      companyId: road.companyId,
      code: road.code,
      name: road.name,
      length: Number(road.length),
      type: road.type,
      status: road.status,
      startPoint: road.startPoint,
      endPoint: road.endPoint,
      startTime: road.startTime,
      endTime: road.endTime,
      totalTurn: road.totalTurn,
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

  private toCmsDriverResponse(driver: TbDriver): CmsDriverResponseDto {
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

  private toResponse(trip: TbTrip): TripResponseDto {
    return {
      id: String(trip.id),
      name: trip.name,
      code: trip.code,
      roadId: String(trip.roadId),
      tripStatus: trip.status,
      description: trip.description ?? undefined,
    };
  }
}
