import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TripService } from '../trip.service';
import { CommonErrorMessage } from '../../assets/messages/common.message';
import { CmsTripSuccessMessage } from '../../assets/messages/cms-trip.message';
import {
  CreateTripPayloadDto,
  UpdateTripPayloadDto,
  TripResponseDto,
  CmsTripDetailResponseDto,
  CmsTripEntityDto,
  CmsTripListResponseDto,
} from '../../dtos/CMS/CMS_trip.dto';
import { CODE_PREFIX } from '../../assets/constants/company.constants';
import { generateEntityCode } from '../../common/helpers/common.helper';
import { TbTrip } from '../../entities/trip.entity';
import { TbRoad } from '../../entities/road.entity';
import { TbDriver } from '../../entities/driver.entity';
import { TbVehicle } from '../../entities/vehicle.entity';
import { UserDecoratorDtoResponse } from '../../dtos/user/common.dto';

@Injectable()
export class CMSTripService {
  constructor(
    private readonly tripService: TripService,
    @InjectRepository(TbRoad)
    private readonly roadRepo: Repository<TbRoad>,
    @InjectRepository(TbDriver)
    private readonly driverRepo: Repository<TbDriver>,
    @InjectRepository(TbVehicle)
    private readonly vehicleRepo: Repository<TbVehicle>,
  ) {}

  async getTripById(
    user: UserDecoratorDtoResponse,
    id: number,
  ): Promise<CmsTripDetailResponseDto> {
    const trip = await this.tripService.findOne(user, id);
    return this.enrichTrips([trip]).then((items) => items[0]);
  }

  async getAllTrips(
    user: UserDecoratorDtoResponse,
    companyId?: number,
    roadId?: number,
  ): Promise<CmsTripListResponseDto> {
    const trips = roadId
      ? await this.tripService.findByRoad(user, roadId)
      : await this.tripService.findAll(user, companyId);
    const items = await this.enrichTrips(trips);
    return { items, total: items.length };
  }

  async createTrip(
    payload: CreateTripPayloadDto,
    user: UserDecoratorDtoResponse,
  ): Promise<TripResponseDto> {
    try {
      const trip = await this.tripService.create(user, {
        code: payload.code?.trim() || generateEntityCode(CODE_PREFIX.TRIP),
        name: payload.name.trim(),
        roadId: payload.roadId,
        driverId: payload.driverId,
        vehicleId: payload.vehicleId,
        description: payload.description?.trim(),
        status: payload.status,
        departure: payload.departure?.trim() ?? '',
        arrival: payload.arrival?.trim() ?? '',
        seatPrice: payload.seatPrice.trim(),
        bookedSeats: payload.bookedSeats ?? 0,
      });
      return (await this.enrichTrips([trip]))[0];
    } catch (error) {
      this.rethrow(error);
    }
  }

  async updateTrip(
    payload: UpdateTripPayloadDto,
    user: UserDecoratorDtoResponse,
  ): Promise<TripResponseDto> {
    try {
      const trip = await this.tripService.update(user, payload.id, {
        name: payload.name.trim(),
        roadId: payload.roadId,
        driverId: payload.driverId,
        vehicleId: payload.vehicleId,
        description: payload.description?.trim(),
        status: payload.status,
        departure: payload.departure?.trim() ?? '',
        arrival: payload.arrival?.trim() ?? '',
        seatPrice: payload.seatPrice.trim(),
        bookedSeats: payload.bookedSeats ?? 0,
      });
      return (await this.enrichTrips([trip]))[0];
    } catch (error) {
      this.rethrow(error);
    }
  }

  async deleteTrip(
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
      this.rethrow(error);
    }
  }

  private async enrichTrips(trips: TbTrip[]): Promise<CmsTripEntityDto[]> {
    if (trips.length === 0) {
      return [];
    }

    const roadIds = [...new Set(trips.map((trip) => trip.roadId))];
    const driverIds = [
      ...new Set(
        trips.map((trip) => trip.driverId).filter((id) => id > 0),
      ),
    ];
    const vehicleIds = [
      ...new Set(
        trips.map((trip) => trip.vehicleId).filter((id) => id > 0),
      ),
    ];

    const roads =
      roadIds.length > 0
        ? await this.roadRepo.find({ where: { id: In(roadIds) } })
        : [];
    const drivers =
      driverIds.length > 0
        ? await this.driverRepo.find({ where: { id: In(driverIds) } })
        : [];
    const vehicles =
      vehicleIds.length > 0
        ? await this.vehicleRepo.find({ where: { id: In(vehicleIds) } })
        : [];

    const roadMap = new Map(roads.map((road) => [road.id, road]));
    const driverMap = new Map(drivers.map((driver) => [driver.id, driver]));
    const vehicleMap = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]));

    return trips.map((trip) => {
      const road = roadMap.get(trip.roadId);
      const driver = driverMap.get(trip.driverId);
      const vehicle = vehicleMap.get(trip.vehicleId);
      const capacity = vehicle?.seatCount ?? 0;
      const bookedSeats = trip.bookedSeats ?? 0;
      const occupancyRate =
        capacity > 0 ? Math.round((bookedSeats / capacity) * 100) : 0;

      const roadName =
        road?.name ||
        (road?.startPoint && road?.endPoint
          ? `${road.startPoint} — ${road.endPoint}`
          : undefined);

      return {
        id: trip.id,
        code: trip.code,
        name: trip.name,
        roadId: trip.roadId,
        companyId: trip.companyId,
        driverId: trip.driverId,
        vehicleId: trip.vehicleId,
        status: trip.status,
        description: trip.description ?? undefined,
        departure: trip.departure ?? '',
        arrival: trip.arrival ?? '',
        seatPrice: trip.seatPrice,
        bookedSeats,
        roadName,
        driverName: driver?.name,
        vehicleLabel: vehicle?.code ?? vehicle?.name,
        capacity,
        occupancyRate,
      };
    });
  }

  private rethrow(error: unknown): never {
    if (error instanceof HttpException) {
      throw error;
    }
    throw new HttpException(
      CommonErrorMessage.CATCH_ERROR.toString(),
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
