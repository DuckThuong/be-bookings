import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { TripService } from '../trip.service';
import { RoadService } from '../road.service';
import { CompanyTripService } from '../company-trip.service';
import { VehicleService } from '../vehicle.service';
import { DriverService } from '../driver.service';
import { CompanyAccessService } from '../company-access.service';
import {
  CreateTripPayloadDto,
  UpdateTripPayloadDto,
  CmsTripFormPayloadDto,
  TripResponseDto,
  CmsTripDetailResponseDto,
  CmsTripListResponseDto,
  CmsTripEntityDto,
  CmsTripRecordDto,
  CmsRoadResponseDto,
} from '../../dtos/CMS/CMS_trip.dto';
import {
  CompanyTripResponseDto,
  CmsDriverResponseDto,
  CmsVehicleEntityDto,
} from '../../dtos/CMS/CMS_vehicle.dto';
import { CommonErrorMessage } from '../../assets/messages/common.message';
import { CmsTripSuccessMessage } from '../../assets/messages/cms-trip.message';
import { CmsTripValidationMessage } from '../../assets/messages/cms-trip.message';
import { TbTrip } from '../../entities/trip.entity';
import { TbRoad } from '../../entities/road.entity';
import { TbCompanyTrip } from '../../entities/company/company-trip.entity';
import { TbVehicle } from '../../entities/vehicle.entity';
import { TbDriver } from '../../entities/driver.entity';
import { UserDecoratorDtoResponse } from '../../dtos/user/common.dto';
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
    private readonly companyAccess: CompanyAccessService,
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
      const { road, vehicle, driver, companyId } = await this.resolveRelations(
        user,
        payload,
      );

      const trip = await this.tripService.create(user, {
        name: this.buildTripName(road, payload),
        code: payload.tripCode?.trim() || generateEntityCode(CODE_PREFIX.TRIP),
        roadId: road.id,
        description: payload.note?.trim() ?? '',
        status: payload.status,
        departure: payload.departure.trim(),
        arrival: payload.arrival.trim(),
      });

      await this.syncCompanyTrip(
        user,
        companyId,
        trip.id,
        payload,
        vehicle.id,
        driver.id,
      );

      const detail = await this.buildTripDetail(user, trip);
      return detail.record;
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
      await this.tripService.findOne(user, payload.id);
      const { road, vehicle, driver, companyId } = await this.resolveRelations(
        user,
        payload,
      );

      const trip = await this.tripService.update(user, payload.id, {
        name: this.buildTripName(road, payload),
        roadId: road.id,
        description: payload.note?.trim() ?? '',
        status: payload.status,
        departure: payload.departure.trim(),
        arrival: payload.arrival.trim(),
      });

      await this.syncCompanyTrip(
        user,
        companyId,
        trip.id,
        payload,
        vehicle.id,
        driver.id,
      );

      const detail = await this.buildTripDetail(user, trip);
      return detail.record;
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

  private async resolveRelations(
    user: UserDecoratorDtoResponse,
    payload: CmsTripFormPayloadDto,
  ) {
    const companyId = await this.companyAccess.resolveCompanyIdForUser(user);
    this.assertSeatMetrics(
      payload.bookedSeats,
      payload.capacity,
      payload.occupancyRate,
    );

    const road = await this.companyAccess.resolveRoadByRouteKey(
      companyId,
      payload.route,
    );
    const vehicle = await this.companyAccess.resolveVehicleByCode(
      companyId,
      payload.vehicle,
    );
    const driver = await this.companyAccess.resolveDriverByCode(
      companyId,
      payload.driver,
    );

    return { road, vehicle, driver, companyId };
  }

  private assertSeatMetrics(
    bookedSeats: number,
    capacity: number,
    occupancyRate: number,
  ): void {
    if (bookedSeats > capacity) {
      throw new BadRequestException(
        CmsTripValidationMessage.BOOKED_EXCEEDS_CAPACITY,
      );
    }
    const expected = this.calcOccupancyRate(bookedSeats, capacity);
    if (Math.abs(occupancyRate - expected) > 0.05) {
      throw new BadRequestException(
        CmsTripValidationMessage.OCCUPANCY_RATE_MISMATCH,
      );
    }
  }

  private calcOccupancyRate(bookedSeats: number, capacity: number): number {
    if (capacity <= 0) {
      return 0;
    }
    return Math.round((bookedSeats / capacity) * 10000) / 100;
  }

  private buildTripName(road: TbRoad, payload: CmsTripFormPayloadDto): string {
    return `${road.name} ${payload.departure}`.trim().slice(0, 255);
  }

  private async syncCompanyTrip(
    user: UserDecoratorDtoResponse,
    companyId: number,
    tripId: number,
    payload: CmsTripFormPayloadDto,
    vehicleId: number,
    driverId: number,
  ): Promise<TbCompanyTrip> {
    const existing = await this.companyTripService.findByTrip(
      user,
      companyId,
      tripId,
    );
    const primary = this.pickPrimaryCompanyTrip(existing);
    const note = payload.note?.trim() ?? '';

    if (primary) {
      return this.companyTripService.update(user, primary.id, {
        vehicleId,
        driverId,
        totalSeat: payload.capacity,
        totalSeatBooked: payload.bookedSeats,
        description: note,
        status: payload.status,
      });
    }

    return this.companyTripService.create(user, {
      companyId,
      tripId,
      vehicleId,
      driverId,
      totalSeat: payload.capacity,
      totalSeatBooked: payload.bookedSeats,
      pricePerSeat: 0,
      description: note,
      status: payload.status,
    });
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
    const [vehicle, driver] = await Promise.all([
      this.loadVehicleForDetail(user, primaryCompanyTrip),
      this.loadDriverForDetail(user, primaryCompanyTrip),
    ]);

    const record = this.toTripRecord(
      trip,
      road,
      vehicle,
      driver,
      primaryCompanyTrip,
    );

    return {
      record,
      trip: this.toCmsTripEntity(trip),
      road,
      vehicle,
      driver,
      companyTrip: primaryCompanyTrip
        ? this.toCompanyTripResponse(primaryCompanyTrip)
        : null,
      companyTrips: companyTrips.map((t) => this.toCompanyTripResponse(t)),
      roadId: String(trip.roadId),
      vehicleId: primaryCompanyTrip ? String(primaryCompanyTrip.vehicleId) : '',
      driverId: primaryCompanyTrip ? String(primaryCompanyTrip.driverId) : '',
      companyTripId: primaryCompanyTrip?.id,
    };
  }

  private toTripRecord(
    trip: TbTrip,
    road: CmsRoadResponseDto | null,
    vehicle: CmsVehicleEntityDto | null,
    driver: CmsDriverResponseDto | null,
    companyTrip: TbCompanyTrip | null,
  ): CmsTripRecordDto {
    const capacity = companyTrip?.totalSeat ?? 0;
    const bookedSeats = companyTrip?.totalSeatBooked ?? 0;

    return {
      key: trip.code,
      id: String(trip.id),
      route: road?.name ?? road?.route ?? '',
      vehicle: vehicle?.code ?? '',
      driver: driver?.code ?? '',
      departure: trip.departure ?? '',
      arrival: trip.arrival ?? '',
      bookedSeats,
      capacity,
      occupancyRate: this.calcOccupancyRate(bookedSeats, capacity),
      status: trip.status,
      note: trip.description ?? '',
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

  private async loadVehicleForDetail(
    user: UserDecoratorDtoResponse,
    companyTrip: TbCompanyTrip | null,
  ): Promise<CmsVehicleEntityDto | null> {
    if (!companyTrip) {
      return null;
    }
    try {
      const entity = await this.vehicalService.findOne(
        user,
        companyTrip.vehicleId,
      );
      return this.toCmsVehicleEntity(entity);
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
      departure: trip.departure ?? '',
      arrival: trip.arrival ?? '',
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

  private toCmsVehicleEntity(vehical: TbVehicle): CmsVehicleEntityDto {
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
      vehicleId: driver.vehicleId,
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
      vehicleId: trip.vehicleId,
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
}
