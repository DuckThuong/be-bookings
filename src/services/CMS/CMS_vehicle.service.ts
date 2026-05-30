import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { VehicleService } from '../vehicle.service';
import { SeatService } from '../seat.service';
import { CommonErrorMessage } from '../../assets/messages/common.message';
import {
  CmsVehicleSuccessMessage,
  CmsVehicleValidationMessage,
} from '../../assets/messages/cms-vehical.message';
import {
  CreateVehiclePayloadDto,
  UpdateVehiclePayloadDto,
  VehicleResponseDto,
  CmsVehicleDetailResponseDto,
  CmsVehicleEntityDto,
  CmsVehicleListResponseDto,
} from '../../dtos/CMS/CMS_vehicle.dto';
import { TbVehicle } from '../../entities/vehicle.entity';
import { TbTrip } from '../../entities/trip.entity';
import { TbRoad } from '../../entities/road.entity';
import { UserDecoratorDtoResponse } from '../../dtos/user/common.dto';
import {
  CreateVehicleDto,
  UpdateVehicleDto,
} from '../../dtos/company/company.dto';
import { TbSeat } from '../../entities/seat.entity';
import { EntityStatus } from '../../assets/constants/company.constants';
import { parsePositiveInt } from '../../common/helpers/common.helper';

type NormalizedVehiclePayload = UpdateVehicleDto & {
  code?: string;
  type?: string;
  name?: string;
  status?: string;
};

type VehicleResponseOptions = {
  seatType?: string;
  seatCount?: number;
  trips?: TbTrip[];
  roadMap?: Map<number, TbRoad>;
};

@Injectable()
export class CMSVehicleService {
  constructor(
    private readonly vehicleService: VehicleService,
    private readonly seatService: SeatService,
    @InjectRepository(TbTrip)
    private readonly tripRepo: Repository<TbTrip>,
    @InjectRepository(TbRoad)
    private readonly roadRepo: Repository<TbRoad>,
  ) {}

  async getVehicleById(
    user: UserDecoratorDtoResponse,
    id: number,
  ): Promise<CmsVehicleDetailResponseDto> {
    const vehicle = await this.vehicleService.findOne(user, id);
    const [item] = await this.enrichVehicles(user, [vehicle]);
    return item;
  }

  async getAllVehicles(
    user: UserDecoratorDtoResponse,
    companyId?: number,
  ): Promise<CmsVehicleListResponseDto> {
    const vehicles = await this.vehicleService.findAll(user, companyId);
    const items = await this.enrichVehicles(user, vehicles);
    return { items, total: items.length };
  }

  async createVehicle(
    payload: CreateVehiclePayloadDto,
    user: UserDecoratorDtoResponse,
  ): Promise<VehicleResponseDto> {
    try {
      this.assertSeatPayload(payload);
      const normalized = this.normalizePayload(payload, true);
      const vehicle = await this.vehicleService.create(
        user,
        normalized as CreateVehicleDto,
      );
      await this.syncSeatsForVehicle(user, vehicle, payload);
      const [item] = await this.enrichVehicles(
        user,
        [await this.vehicleService.findOne(user, vehicle.id)],
        {
          seatType: this.trimOptional(payload.seatType),
          seatCount: parsePositiveInt(payload.seatCount),
        },
      );
      return item;
    } catch (error) {
      this.rethrow(error);
    }
  }

  async updateVehicle(
    payload: UpdateVehiclePayloadDto,
    user: UserDecoratorDtoResponse,
  ): Promise<VehicleResponseDto> {
    try {
      const parsedSeatCount = parsePositiveInt(payload.seatCount);
      const normalized = this.normalizePayload(payload, false);
      const vehicle = await this.vehicleService.update(
        user,
        payload.id,
        normalized,
      );

      if (
        parsedSeatCount !== undefined ||
        this.trimOptional(payload.seatType)
      ) {
        await this.syncSeatsForVehicle(user, vehicle, {
          ...payload,
          seatCount: parsedSeatCount ?? payload.seatCount,
        });

        if (parsedSeatCount !== undefined) {
          await this.vehicleService.update(user, payload.id, {
            seatCount: parsedSeatCount,
          });
        }
      }

      const [item] = await this.enrichVehicles(
        user,
        [await this.vehicleService.findOne(user, vehicle.id)],
        {
          seatType: this.trimOptional(payload.seatType),
          seatCount: parsedSeatCount,
        },
      );
      return item;
    } catch (error) {
      this.rethrow(error);
    }
  }

  async deleteVehicle(
    user: UserDecoratorDtoResponse,
    id: number,
  ): Promise<{ message: string; vehicalId: number }> {
    try {
      const vehicle = await this.vehicleService.findOne(user, id);
      await this.seatService.removeAllByVehicle(user, vehicle.companyId, id);
      await this.vehicleService.remove(user, id);
      return {
        message: CmsVehicleSuccessMessage.DELETE_SUCCESS,
        vehicalId: id,
      };
    } catch (error) {
      this.rethrow(error);
    }
  }

  private async enrichVehicles(
    user: UserDecoratorDtoResponse,
    vehicles: TbVehicle[],
    responseOptions?: Pick<VehicleResponseOptions, 'seatType' | 'seatCount'>,
  ): Promise<CmsVehicleEntityDto[]> {
    if (vehicles.length === 0) {
      return [];
    }

    const vehicleIds = vehicles.map((vehicle) => vehicle.id);
    const trips = await this.tripRepo.find({
      where: { vehicleId: In(vehicleIds) },
      order: { id: 'DESC' },
    });
    const roadIds = [...new Set(trips.map((trip) => trip.roadId))];
    const roads =
      roadIds.length > 0
        ? await this.roadRepo.find({ where: { id: In(roadIds) } })
        : [];
    const roadMap = new Map(roads.map((road) => [road.id, road]));
    const tripsByVehicle = new Map<number, TbTrip[]>();

    for (const trip of trips) {
      const vehicleTrips = tripsByVehicle.get(trip.vehicleId) ?? [];
      vehicleTrips.push(trip);
      tripsByVehicle.set(trip.vehicleId, vehicleTrips);
    }

    return Promise.all(
      vehicles.map((vehicle) =>
        this.toResponse(user, vehicle, {
          trips: tripsByVehicle.get(vehicle.id) ?? [],
          roadMap,
          ...responseOptions,
        }),
      ),
    );
  }

  private async toResponse(
    user: UserDecoratorDtoResponse,
    vehicle: TbVehicle,
    options?: VehicleResponseOptions,
  ): Promise<CmsVehicleEntityDto> {
    const seats = await this.seatService.findByVehicle(
      user,
      vehicle.companyId,
      vehicle.id,
    );
    const activeSeats = this.sortSeatsByOrdinalAsc(
      seats.filter((seat) => seat.status === EntityStatus.ACTIVE),
    );
    const storedSeatCount = parsePositiveInt(vehicle.seatCount) ?? 0;

    return {
      id: vehicle.id,
      companyId: vehicle.companyId,
      image: vehicle.image ?? undefined,
      code: vehicle.code,
      type: vehicle.type,
      schedule: this.resolveSchedule(
        vehicle,
        options?.trips ?? [],
        options?.roadMap ?? new Map(),
      ),
      status: vehicle.status,
      name: vehicle.name,
      description: vehicle.description ?? undefined,
      seatType:
        activeSeats[0]?.type ??
        seats.find((seat) => seat.type)?.type ??
        options?.seatType ??
        '',
      seatCount: Math.max(
        storedSeatCount,
        activeSeats.length,
        options?.seatCount ?? 0,
      ),
    };
  }

  private resolveSchedule(
    vehicle: TbVehicle,
    trips: TbTrip[],
    roadMap: Map<number, TbRoad>,
  ): string | undefined {
    const storedSchedule = vehicle.schedule?.trim();
    if (storedSchedule) {
      return storedSchedule;
    }

    const activeTrips = trips.filter(
      (trip) => trip.status?.toUpperCase() === EntityStatus.ACTIVE,
    );

    if (activeTrips.length === 0) {
      return undefined;
    }

    const labels = activeTrips
      .map((trip) => this.buildTripScheduleLabel(trip, roadMap.get(trip.roadId)))
      .filter(Boolean) as string[];

    if (labels.length === 0) {
      return undefined;
    }

    return [...new Set(labels)].join(', ');
  }

  private buildTripScheduleLabel(
    trip: TbTrip,
    road?: TbRoad,
  ): string | undefined {
    const departureTime = this.extractDepartureTime(trip.departure);
    const tripsPerDay = road?.tripsPerDay ?? 0;

    if (tripsPerDay > 0 && departureTime) {
      return `${tripsPerDay} chuyến/ngày — ${departureTime}`;
    }

    if (tripsPerDay > 0) {
      return `${tripsPerDay} chuyến/ngày`;
    }

    if (departureTime) {
      return `Hàng ngày ${departureTime}`;
    }

    return road?.name ?? trip.name;
  }

  private extractDepartureTime(departure?: string | null): string | undefined {
    const value = departure?.trim();
    if (!value) {
      return undefined;
    }

    const dailyMatch = value.match(/Hàng ngày\s+(\d{1,2}:\d{2})/i);
    if (dailyMatch) {
      return dailyMatch[1];
    }

    const dateTimeMatch = value.match(
      /\d{1,2}\/\d{1,2}\/\d{2,4}\s+(\d{1,2}:\d{2})/,
    );
    if (dateTimeMatch) {
      return dateTimeMatch[1];
    }

    const timeMatch = value.match(/^(\d{1,2}:\d{2})(?::\d{2})?$/);
    if (timeMatch) {
      return timeMatch[1];
    }

    return undefined;
  }

  private normalizePayload(
    payload: CreateVehiclePayloadDto | UpdateVehiclePayloadDto,
    requireRequiredFields: boolean,
  ): NormalizedVehiclePayload {
    const code = payload.code?.trim() || '';
    const type = payload.type?.trim() || '';
    const name = payload.name?.trim() || '';
    const status = payload.status?.trim() || '';
    const seatCount = parsePositiveInt(payload.seatCount);

    if (requireRequiredFields) {
      if (!code) {
        throw new BadRequestException(
          CmsVehicleValidationMessage.VEHICAL_CODE_EMPTY,
        );
      }
      if (!type) {
        throw new BadRequestException(
          CmsVehicleValidationMessage.VEHICAL_TYPE_EMPTY,
        );
      }
      if (!name) {
        throw new BadRequestException(
          CmsVehicleValidationMessage.VEHICAL_NAME_EMPTY,
        );
      }
      if (!status) {
        throw new BadRequestException(
          CmsVehicleValidationMessage.VEHICAL_STATUS_EMPTY,
        );
      }
    }

    return {
      ...(code !== undefined ? { code } : {}),
      ...(type !== undefined ? { type } : {}),
      ...(name !== undefined ? { name } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(seatCount !== undefined ? { seatCount } : {}),
      ...(payload.image !== undefined
        ? { image: this.trimOptional(payload.image) }
        : {}),
      ...(payload.schedule !== undefined
        ? { schedule: this.trimOptional(payload.schedule) }
        : {}),
      ...(payload.description !== undefined
        ? { description: this.trimOptional(payload.description) }
        : {}),
    };
  }

  private trimOptional(value?: string | null): string | undefined {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  }

  private assertSeatPayload(payload: CreateVehiclePayloadDto): void {
    if (!this.trimOptional(payload.seatType)) {
      throw new BadRequestException(
        CmsVehicleValidationMessage.SEAT_TYPE_EMPTY,
      );
    }

    if (parsePositiveInt(payload.seatCount) === undefined) {
      throw new BadRequestException(CmsVehicleValidationMessage.SEAT_COUNT_MIN);
    }
  }

  private async syncSeatsForVehicle(
    user: UserDecoratorDtoResponse,
    vehicle: TbVehicle,
    payload: CreateVehiclePayloadDto | UpdateVehiclePayloadDto,
  ): Promise<TbSeat[]> {
    const allSeats = await this.seatService.findByVehicle(
      user,
      vehicle.companyId,
      vehicle.id,
    );
    let activeSeats = this.sortSeatsByOrdinalAsc(
      allSeats.filter((seat) => seat.status === EntityStatus.ACTIVE),
    );
    const targetCount =
      parsePositiveInt(payload.seatCount) ?? activeSeats.length;
    const targetType =
      this.trimOptional(payload.seatType) ?? activeSeats[0]?.type;

    if (targetCount > 0 && !targetType) {
      throw new BadRequestException(
        CmsVehicleValidationMessage.SEAT_TYPE_EMPTY,
      );
    }

    if (targetCount > activeSeats.length) {
      const maxOrdinal = this.getMaxSeatOrdinal(activeSeats);
      const createdSeats = await this.seatService.createBatch(user, {
        companyId: vehicle.companyId,
        vehicleId: vehicle.id,
        seats: this.buildSeatItems(
          targetType,
          targetCount - activeSeats.length,
          maxOrdinal,
        ),
      });
      activeSeats = this.sortSeatsByOrdinalAsc([
        ...activeSeats,
        ...createdSeats,
      ]);
    }

    if (targetCount < activeSeats.length) {
      const removeCount = activeSeats.length - targetCount;
      const seatsToRemove = this.sortSeatsByOrdinalDesc(activeSeats).slice(
        0,
        removeCount,
      );

      for (const seat of seatsToRemove) {
        await this.seatService.remove(user, seat.id, vehicle.companyId);
      }

      const removedIds = new Set(seatsToRemove.map((seat) => seat.id));
      activeSeats = activeSeats.filter((seat) => !removedIds.has(seat.id));
    }

    activeSeats = this.sortSeatsByOrdinalAsc(activeSeats);
    await Promise.all(
      activeSeats.map((seat, index) =>
        this.seatService.update(user, seat.id, vehicle.companyId, {
          name: this.buildSeatName(targetType, index + 1),
          index: String(index + 1),
          type: targetType,
          description: seat.description ?? 'Ghe mac dinh',
        }),
      ),
    );

    return activeSeats;
  }

  private buildSeatItems(seatType: string, count: number, startOffset: number) {
    return Array.from({ length: count }, (_, index) => {
      const ordinal = startOffset + index + 1;
      return {
        name: this.buildSeatName(seatType, ordinal),
        index: String(ordinal),
        type: seatType,
        description: 'Ghe mac dinh',
      };
    });
  }

  private buildSeatName(seatType: string, ordinal: number): string {
    const prefix = seatType.trim().charAt(0).toUpperCase() || 'S';
    return `${prefix}-${ordinal}`;
  }

  private getSeatOrdinal(seat: TbSeat): number {
    const fromIndex = Number(seat.index);
    if (!Number.isNaN(fromIndex) && fromIndex > 0) {
      return fromIndex;
    }

    const match = seat.name.match(/-(\d+)$/);
    return match ? Number(match[1]) : 0;
  }

  private getMaxSeatOrdinal(seats: TbSeat[]): number {
    return seats.reduce(
      (max, seat) => Math.max(max, this.getSeatOrdinal(seat)),
      0,
    );
  }

  private sortSeatsByOrdinalAsc(seats: TbSeat[]): TbSeat[] {
    return [...seats].sort(
      (a, b) => this.getSeatOrdinal(a) - this.getSeatOrdinal(b),
    );
  }

  private sortSeatsByOrdinalDesc(seats: TbSeat[]): TbSeat[] {
    return [...seats].sort(
      (a, b) => this.getSeatOrdinal(b) - this.getSeatOrdinal(a),
    );
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
