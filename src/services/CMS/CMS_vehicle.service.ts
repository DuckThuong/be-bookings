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
import {
  buildVehicleLayout,
  normalizeVehicleLayoutConfig,
  parseStoredLayoutConfig,
  VehicleLayoutConfig,
} from '../../common/seat-layout/seat-layout';
import { TbBooking } from '../../entities/sales/booking.entity';
import { BookingStatus } from '../../assets/constants/sales.constants';

type NormalizedVehiclePayload = UpdateVehicleDto & {
  code?: string;
  type?: string;
  name?: string;
  status?: string;
};

type VehicleResponseOptions = {
  seatType?: string;
  seatCount?: number;
  layoutConfig?: VehicleLayoutConfig;
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
    @InjectRepository(TbBooking)
    private readonly bookingRepo: Repository<TbBooking>,
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
  ): Promise<CmsVehicleListResponseDto> {
    const vehicles = await this.vehicleService.findAll(user);
    const items = await this.enrichVehicles(user, vehicles);
    return { items, total: items.length };
  }

  async createVehicle(
    payload: CreateVehiclePayloadDto,
    user: UserDecoratorDtoResponse,
  ): Promise<VehicleResponseDto> {
    try {
      const layout = this.resolveVehicleLayout(payload);
      const normalized = {
        ...this.normalizePayload(payload, true),
        seatCount: layout.seatCount,
        layoutConfig: layout.config,
      };
      const vehicle = await this.vehicleService.create(
        user,
        normalized as CreateVehicleDto,
      );
      await this.syncSeatsForVehicle(user, vehicle, layout.config);
      const [item] = await this.enrichVehicles(
        user,
        [await this.vehicleService.findOne(user, vehicle.id)],
        {
          seatType: layout.config.seatType,
          seatCount: layout.seatCount,
          layoutConfig: layout.config,
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
      const existing = await this.vehicleService.findOne(user, payload.id);
      const shouldSyncLayout =
        payload.layoutPreset !== undefined ||
        payload.layoutConfig !== undefined ||
        payload.seatType !== undefined ||
        payload.seatCount !== undefined;
      const layout = shouldSyncLayout
        ? this.resolveVehicleLayout(payload, existing)
        : undefined;

      if (layout) {
        await this.assertNoActiveBookingsForLayoutChange(existing.id);
      }

      const normalized = {
        ...this.normalizePayload(payload, false),
        ...(layout
          ? { seatCount: layout.seatCount, layoutConfig: layout.config }
          : {}),
      };
      const vehicle = await this.vehicleService.update(
        user,
        payload.id,
        normalized,
      );

      if (layout) {
        await this.syncSeatsForVehicle(user, vehicle, layout.config);
      }

      const [item] = await this.enrichVehicles(
        user,
        [await this.vehicleService.findOne(user, vehicle.id)],
        {
          seatType: layout?.config.seatType,
          seatCount: layout?.seatCount,
          layoutConfig: layout?.config,
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
    responseOptions?: Pick<
      VehicleResponseOptions,
      'seatType' | 'seatCount' | 'layoutConfig'
    >,
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
      layoutPreset:
        options?.layoutConfig?.preset ??
        parseStoredLayoutConfig(vehicle.layoutConfig)?.preset,
      layoutConfig:
        options?.layoutConfig ??
        parseStoredLayoutConfig(vehicle.layoutConfig) ??
        null,
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
      .map((trip) =>
        this.buildTripScheduleLabel(trip, roadMap.get(trip.roadId)),
      )
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
    const layoutConfig = parseStoredLayoutConfig(payload.layoutConfig);

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
      ...(layoutConfig !== undefined ? { layoutConfig } : {}),
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

  private async syncSeatsForVehicle(
    user: UserDecoratorDtoResponse,
    vehicle: TbVehicle,
    layoutConfig: VehicleLayoutConfig,
  ): Promise<TbSeat[]> {
    const layout = buildVehicleLayout(layoutConfig);
    await this.seatService.removeAllByVehicle(
      user,
      vehicle.companyId,
      vehicle.id,
    );

    return this.seatService.createBatch(user, {
      companyId: vehicle.companyId,
      vehicleId: vehicle.id,
      seats: layout.seatCells.map((cell) => ({
        name: cell.label,
        index: String(cell.ordinal),
        type: layout.config.seatType,
        description: JSON.stringify({
          floor: cell.floor,
          row: cell.row,
          column: cell.column,
        }),
      })),
    });
  }

  private getSeatOrdinal(seat: TbSeat): number {
    const fromIndex = Number(seat.index);
    if (!Number.isNaN(fromIndex) && fromIndex > 0) {
      return fromIndex;
    }

    const match = seat.name.match(/-(\d+)$/);
    return match ? Number(match[1]) : 0;
  }

  private sortSeatsByOrdinalAsc(seats: TbSeat[]): TbSeat[] {
    return [...seats].sort(
      (a, b) => this.getSeatOrdinal(a) - this.getSeatOrdinal(b),
    );
  }

  private resolveVehicleLayout(
    payload: CreateVehiclePayloadDto | UpdateVehiclePayloadDto,
    existing?: TbVehicle,
  ) {
    const existingConfig = parseStoredLayoutConfig(existing?.layoutConfig);
    const config = normalizeVehicleLayoutConfig(
      {
        ...(existingConfig ?? {}),
        ...(payload.layoutConfig ?? {}),
        preset:
          payload.layoutPreset ??
          payload.layoutConfig?.preset ??
          existingConfig?.preset,
        seatType:
          this.trimOptional(payload.seatType) ??
          payload.layoutConfig?.seatType ??
          existingConfig?.seatType,
      },
      {
        seatType:
          this.trimOptional(payload.seatType) ?? existingConfig?.seatType,
        seatCount: parsePositiveInt(payload.seatCount) ?? existing?.seatCount,
        vehicleType: payload.type ?? existing?.type,
      },
    );

    return buildVehicleLayout(config);
  }

  private async assertNoActiveBookingsForLayoutChange(
    vehicleId: number,
  ): Promise<void> {
    const trips = await this.tripRepo.find({ where: { vehicleId } });
    const tripIds = trips.map((trip) => trip.id);
    if (tripIds.length === 0) return;

    const activeBooking = await this.bookingRepo.findOne({
      where: {
        tripId: In(tripIds),
        status: In([
          BookingStatus.HOLD,
          BookingStatus.CONVERTED,
          BookingStatus.CONFIRMED,
        ]),
      },
    });

    if (activeBooking) {
      throw new BadRequestException(
        'Không thể đổi sơ đồ ghế khi xe đã có booking đang hoạt động',
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
