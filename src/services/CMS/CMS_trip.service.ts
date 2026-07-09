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
  UpdateOperationStatusPayloadDto,
  ResetTripOperationStatusPayloadDto,
} from '../../dtos/CMS/CMS_trip.dto';
import { CODE_PREFIX, MasterDataType } from '../../assets/constants/company.constants';
import { generateEntityCode } from '../../common/helpers/common.helper';
import { TbTrip } from '../../entities/trip.entity';
import { TbRoad } from '../../entities/road.entity';
import { TbDriver } from '../../entities/driver.entity';
import { TbVehicle } from '../../entities/vehicle.entity';
import { UserDecoratorDtoResponse } from '../../dtos/user/common.dto';
import { TripStatus, TRIP_STATUSES_ALLOW_RESTART } from '../../assets/constants/company.constants';
import { MasterDataService } from '../master-data.service';

@Injectable()
export class CMSTripService {
  constructor(
    private readonly tripService: TripService,
    private readonly masterDataService: MasterDataService,
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
    roadId?: number,
  ): Promise<CmsTripListResponseDto> {
    const trips = roadId
      ? await this.tripService.findByRoad(user, roadId)
      : await this.tripService.findAll(user);
    const items = await this.enrichTrips(trips);
    return { items, total: items.length };
  }

  async createTrip(
    payload: CreateTripPayloadDto,
    user: UserDecoratorDtoResponse,
  ): Promise<TripResponseDto> {
    try {
      await this.validateEntityStatus(payload.status);
      await this.validateOperationStatus(payload.operationStatus);

      const trip = await this.tripService.create(user, {
        code: payload.code?.trim() || generateEntityCode(CODE_PREFIX.TRIP),
        name: payload.name.trim(),
        roadId: payload.roadId,
        driverId: payload.driverId,
        vehicleId: payload.vehicleId,
        description: payload.description?.trim(),
        status: payload.status,
        operationStatus: payload.operationStatus ?? 'SCHEDULED',
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
      await this.validateEntityStatus(payload.status);
      await this.validateOperationStatus(payload.operationStatus);

      const trip = await this.tripService.update(user, payload.id, {
        name: payload.name.trim(),
        roadId: payload.roadId,
        driverId: payload.driverId,
        vehicleId: payload.vehicleId,
        description: payload.description?.trim(),
        status: payload.status,
        operationStatus: payload.operationStatus,
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

  async updateOperationStatus(
    user: UserDecoratorDtoResponse,
    payload: UpdateOperationStatusPayloadDto,
  ): Promise<{ message: string; trip: CmsTripEntityDto }> {
    try {
      await this.validateOperationStatus(payload.operationStatus);

      const trip = await this.tripService.update(user, payload.id, {
        operationStatus: payload.operationStatus,
      });
      const enrichedTrip = (await this.enrichTrips([trip]))[0];
      return {
        message: CmsTripSuccessMessage.OPERATION_STATUS_UPDATE_SUCCESS,
        trip: enrichedTrip,
      };
    } catch (error) {
      this.rethrow(error);
    }
  }

  async resetOperationStatus(
    user: UserDecoratorDtoResponse,
    payload: ResetTripOperationStatusPayloadDto,
  ): Promise<{ message: string; trip: CmsTripEntityDto }> {
    try {
      // Get current trip to check operation status
      const currentTrip = await this.tripService.findOne(user, payload.id);
      
      if (!currentTrip) {
        throw new HttpException(
          'Không tìm thấy chuyến xe',
          HttpStatus.NOT_FOUND,
        );
      }

      const currentStatus = currentTrip.operationStatus as TripStatus;
      
      // Check if current status allows restart
      if (!TRIP_STATUSES_ALLOW_RESTART.includes(currentStatus)) {
        throw new HttpException(
          `Không thể bắt đầu lại chuyến xe có trạng thái "${currentStatus}". Chỉ chuyến xe đã hoàn thành hoặc đã hủy mới có thể bắt đầu lại.`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Reset to SCHEDULED
      const trip = await this.tripService.update(user, payload.id, {
        operationStatus: TripStatus.SCHEDULED,
      });
      const enrichedTrip = (await this.enrichTrips([trip]))[0];
      return {
        message: 'Bắt đầu lại chuyến xe thành công',
        trip: enrichedTrip,
      };
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
      ...new Set(trips.map((trip) => trip.driverId).filter((id) => id > 0)),
    ];
    const vehicleIds = [
      ...new Set(trips.map((trip) => trip.vehicleId).filter((id) => id > 0)),
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
    const vehicleMap = new Map(
      vehicles.map((vehicle) => [vehicle.id, vehicle]),
    );

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
        operationStatus: trip.operationStatus,
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

  private async validateEntityStatus(status: string): Promise<void> {
    const statuses = await this.masterDataService.getByTypes([MasterDataType.ROUTE_STATUS]);
    const validStatuses = statuses[MasterDataType.ROUTE_STATUS] ?? [];
    const validCodes = validStatuses.map((s) => s.code);

    if (!validCodes.includes(status)) {
      const validNames = validStatuses.map((s) => s.name).join(', ');
      throw new HttpException(
        {
          message: [`Trạng thái không hợp lệ. Chọn: ${validNames}`],
          error: 'Bad Request',
          statusCode: 400,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async validateOperationStatus(status: string | undefined): Promise<void> {
    if (!status) return;
    
    const statuses = await this.masterDataService.getByTypes([MasterDataType.TRIP_STATUS]);
    const validStatuses = statuses[MasterDataType.TRIP_STATUS] ?? [];
    const validCodes = validStatuses.map((s) => s.code);

    if (!validCodes.includes(status)) {
      const validNames = validStatuses.map((s) => s.name).join(', ');
      throw new HttpException(
        {
          message: [`Trạng thái vận hành không hợp lệ. Chọn: ${validNames}`],
          error: 'Bad Request',
          statusCode: 400,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
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
