import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
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

@Injectable()
export class CMSVehicleService {
  constructor(
    private readonly vehicleService: VehicleService,
    private readonly seatService: SeatService,
  ) {}

  async getVehicleById(
    user: UserDecoratorDtoResponse,
    id: number,
  ): Promise<CmsVehicleDetailResponseDto> {
    return this.toResponse(user, await this.vehicleService.findOne(user, id));
  }

  async getAllVehicles(
    user: UserDecoratorDtoResponse,
    companyId?: number,
  ): Promise<CmsVehicleListResponseDto> {
    const vehicles = await this.vehicleService.findAll(user, companyId);
    const items = await Promise.all(
      vehicles.map((vehicle) => this.toResponse(user, vehicle)),
    );
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
      return this.toResponse(
        user,
        await this.vehicleService.findOne(user, vehicle.id),
        {
          seatType: this.trimOptional(payload.seatType),
          seatCount: parsePositiveInt(payload.seatCount),
        },
      );
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

      return this.toResponse(
        user,
        await this.vehicleService.findOne(user, vehicle.id),
        {
          seatType: this.trimOptional(payload.seatType),
          seatCount: parsedSeatCount,
        },
      );
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

  private async toResponse(
    user: UserDecoratorDtoResponse,
    vehicle: TbVehicle,
    options?: { seatType?: string; seatCount?: number },
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
      schedule: vehicle.schedule ?? undefined,
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
