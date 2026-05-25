import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
import { UserDecoratorDtoResponse } from '../../dtos/user/common.dto';

@Injectable()
export class CMSTripService {
  constructor(private readonly tripService: TripService) {}

  async getTripById(
    user: UserDecoratorDtoResponse,
    id: number,
  ): Promise<CmsTripDetailResponseDto> {
    return this.toResponse(await this.tripService.findOne(user, id));
  }

  async getAllTrips(
    user: UserDecoratorDtoResponse,
    companyId?: number,
    roadId?: number,
  ): Promise<CmsTripListResponseDto> {
    const trips = roadId
      ? await this.tripService.findByRoad(user, roadId)
      : await this.tripService.findAll(user, companyId);
    const items = trips.map((trip) => this.toResponse(trip));
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
      return this.toResponse(trip);
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
      return this.toResponse(trip);
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

  private toResponse(trip: TbTrip): CmsTripEntityDto {
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
      bookedSeats: trip.bookedSeats,
    };
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
