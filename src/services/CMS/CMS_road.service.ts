import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { RoadService } from '../road.service';
import { TripService } from '../trip.service';
import { CompanyTripService } from '../company-trip.service';
import { VehicleService } from '../vehicle.service';
import { DriverService } from '../driver.service';
import { CompanyAccessService } from '../company-access.service';
import {
  CreateRoadPayloadDto,
  UpdateRoadPayloadDto,
  RoadResponseDto,
  CmsRoadDetailResponseDto,
  CmsRoadListResponseDto,
} from '../../dtos/CMS/CMS_road.dto';
import {
  CmsRoadResponseDto,
  CmsTripEntityDto,
} from '../../dtos/CMS/CMS_trip.dto';
import {
  CompanyTripResponseDto,
  CmsDriverResponseDto,
  CmsVerhicalEntityDto,
} from '../../dtos/CMS/CMS_verhical.dto';
import { CommonErrorMessage } from '../../assets/messages/common.message';
import { CmsRoadSuccessMessage } from '../../assets/messages/cms-road.message';
import { TbRoad } from '../../entities/road.entity';
import { TbTrip } from '../../entities/trip.entity';
import { TbCompanyTrip } from '../../entities/company/company-trip.entity';
import { TbVerhical } from '../../entities/verhical.entity';
import { TbDriver } from '../../entities/driver.entity';
import { UserDecoratorDtoResponse } from '../../dtos/user/common.dto';
import {
  CreateRoadDto,
  UpdateRoadDto,
} from '../../dtos/company/company.dto';
import { EntityStatus } from '../../assets/constants/company.constants';
import { generateEntityCode } from '../../common/helpers/common.helper';
import { CODE_PREFIX } from '../../assets/constants/company.constants';

@Injectable()
export class CMSRoadService {
  constructor(
    private readonly roadService: RoadService,
    private readonly tripService: TripService,
    private readonly companyTripService: CompanyTripService,
    private readonly vehicalService: VehicleService,
    private readonly driverService: DriverService,
    private readonly companyAccess: CompanyAccessService,
  ) {}

  public async getRoadById(
    user: UserDecoratorDtoResponse,
    id: number,
  ): Promise<CmsRoadDetailResponseDto> {
    const road = await this.roadService.findOne(user, id);
    return this.buildRoadDetail(user, road);
  }

  public async getAllRoads(
    user: UserDecoratorDtoResponse,
    companyId?: number,
  ): Promise<CmsRoadListResponseDto> {
    const roads = await this.roadService.findAll(user, companyId);
    const items = await Promise.all(
      roads.map((r) => this.buildRoadDetail(user, r)),
    );
    return { items, total: items.length };
  }

  public async createRoad(
    payload: CreateRoadPayloadDto,
    user: UserDecoratorDtoResponse,
  ): Promise<RoadResponseDto> {
    try {
      const companyId = await this.companyAccess.resolveCompanyIdForUser(user);
      const road = await this.roadService.create(
        user,
        this.toCreateRoadDto(payload, companyId),
      );
      return this.toResponse(road);
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

  public async updateRoad(
    payload: UpdateRoadPayloadDto,
    user: UserDecoratorDtoResponse,
  ): Promise<RoadResponseDto> {
    try {
      const road = await this.roadService.update(
        user,
        payload.id,
        this.toUpdateRoadDto(payload),
      );
      return this.toResponse(road);
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

  public async deleteRoad(
    user: UserDecoratorDtoResponse,
    id: number,
  ): Promise<{ message: string; roadId: number }> {
    try {
      await this.roadService.remove(user, id);
      return {
        message: CmsRoadSuccessMessage.DELETE_SUCCESS,
        roadId: id,
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

  private toCreateRoadDto(
    payload: CreateRoadPayloadDto,
    companyId: number,
  ): CreateRoadDto {
    return {
      companyId,
      code: payload.roadCode?.trim() || generateEntityCode(CODE_PREFIX.ROAD),
      name: payload.route.trim(),
      length: payload.distanceKm,
      type: payload.roadType?.trim() || 'STANDARD',
      startPoint: payload.startPoint?.trim() ?? '',
      endPoint: payload.endPoint?.trim() ?? '',
      startTime: payload.startTime ?? '00:00',
      endTime: payload.endTime ?? '00:00',
      status: payload.roadStatus,
      standardDuration: payload.standardDuration.trim(),
      tripsPerDay: payload.tripsPerDay,
      averageOccupancy: payload.averageOccupancy,
      estimatedRevenue: payload.estimatedRevenue,
      leadVehicle: payload.leadVehicle?.trim() || null,
      demandLevel: payload.demandLevel?.trim() || null,
      note: payload.note?.trim() || null,
    };
  }

  private toUpdateRoadDto(payload: UpdateRoadPayloadDto): UpdateRoadDto {
    return {
      name: payload.route.trim(),
      length: payload.distanceKm,
      type: payload.roadType?.trim() || 'STANDARD',
      startPoint: payload.startPoint?.trim() ?? '',
      endPoint: payload.endPoint?.trim() ?? '',
      startTime: payload.startTime ?? '00:00',
      endTime: payload.endTime ?? '00:00',
      status: payload.roadStatus,
      standardDuration: payload.standardDuration.trim(),
      tripsPerDay: payload.tripsPerDay,
      averageOccupancy: payload.averageOccupancy,
      estimatedRevenue: payload.estimatedRevenue,
      leadVehicle: payload.leadVehicle?.trim() || null,
      demandLevel: payload.demandLevel?.trim() || null,
      note: payload.note?.trim() || null,
    };
  }

  private async buildRoadDetail(
    user: UserDecoratorDtoResponse,
    road: TbRoad,
  ): Promise<CmsRoadDetailResponseDto> {
    const trips = await this.tripService.findByRoad(user, road.id);
    const activeTrips = trips.filter((t) => t.status === EntityStatus.ACTIVE);
    const primaryTrip = this.pickPrimaryTrip(trips);

    const companyTrips = primaryTrip
      ? await this.companyTripService.findByTrip(
          user,
          road.companyId,
          primaryTrip.id,
        )
      : [];

    const primaryCompanyTrip = this.pickPrimaryCompanyTrip(companyTrips);
    const [verhical, driver] = await Promise.all([
      this.loadVerhicalForDetail(user, primaryCompanyTrip),
      this.loadDriverForDetail(user, primaryCompanyTrip),
    ]);

    return {
      road: this.toCmsRoadResponse(road),
      trips: trips.map((t) => this.toCmsTripEntity(t)),
      trip: primaryTrip ? this.toCmsTripEntity(primaryTrip) : null,
      verhical,
      driver,
      companyTrip: primaryCompanyTrip
        ? this.toCompanyTripResponse(primaryCompanyTrip)
        : null,
      companyTrips: companyTrips.map((t) => this.toCompanyTripResponse(t)),
      tripCount: activeTrips.length,
      tripId: primaryTrip ? String(primaryTrip.id) : '',
      verhicalId: primaryCompanyTrip
        ? String(primaryCompanyTrip.verhicalId)
        : '',
      driverId: primaryCompanyTrip
        ? String(primaryCompanyTrip.driverId)
        : '',
      companyTripId: primaryCompanyTrip?.id,
    };
  }

  private pickPrimaryTrip(trips: TbTrip[]): TbTrip | null {
    if (!trips.length) {
      return null;
    }
    const active = trips.filter((t) => t.status === EntityStatus.ACTIVE);
    const pool = active.length ? active : trips;
    return [...pool].sort((a, b) => b.id - a.id)[0];
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
      standardDuration: road.standardDuration ?? '',
      tripsPerDay: road.tripsPerDay ?? 0,
      averageOccupancy: Number(road.averageOccupancy ?? 0),
      estimatedRevenue: Number(road.estimatedRevenue ?? 0),
      leadVehicle: road.leadVehicle,
      demandLevel: road.demandLevel,
      note: road.note,
      distanceKm: Number(road.length),
      route: road.name,
      roadCode: road.code,
    };
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

  private toResponse(road: TbRoad): RoadResponseDto {
    return {
      id: String(road.id),
      roadCode: road.code,
      route: road.name,
      distanceKm: Number(road.length),
      standardDuration: road.standardDuration ?? '',
      tripsPerDay: road.tripsPerDay ?? 0,
      averageOccupancy: Number(road.averageOccupancy ?? 0),
      estimatedRevenue: Number(road.estimatedRevenue ?? 0),
      roadStatus: road.status,
      leadVehicle: road.leadVehicle,
      demandLevel: road.demandLevel,
      note: road.note,
      roadType: road.type,
      startPoint: road.startPoint,
      endPoint: road.endPoint,
      startTime: road.startTime,
      endTime: road.endTime,
      totalTurn: road.totalTurn,
    };
  }
}
