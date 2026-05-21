import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { VehicleService } from '../vehicle.service';

import { SeatService } from '../seat.service';

import { CompanyTripService } from '../company-trip.service';

import { TripService } from '../trip.service';

import { DriverService } from '../driver.service';

import {
  CmsDriverResponseDto,
  CmsSeatResponseDto,
  CmsTripResponseDto,
  CmsVehicalDetailResponseDto,
  CmsVehicalListResponseDto,
  CmsVerhicalEntityDto,
  CompanyTripResponseDto,
  CreateVehicalPayloadDto,
  UpdateVehicalPayloadDto,
  VehicalResponseDto,
} from '../../dtos/CMS/CMS_verhical.dto';

import { CommonErrorMessage } from '../../assets/messages/common.message';

import {
  CmsVehicalErrorMessage,
  CmsVehicalSuccessMessage,
  CmsVehicalValidationMessage,
} from '../../assets/messages/cms-vehical.message';

import { TbCompanyTrip } from '../../entities/company/company-trip.entity';

import { UserDecoratorDtoResponse } from '../../dtos/user/common.dto';

import {
  CreateCompanyTripDto,
  CreateSeatItemDto,
  CreateVehicleDto,
  UpdateCompanyTripDto,
  UpdateVehicleDto,
} from '../../dtos/company/company.dto';

import { EntityStatus } from '../../assets/constants/company.constants';

import {
  generateEntityCode,
  validString,
} from '../../common/helpers/common.helper';

import { CODE_PREFIX } from '../../assets/constants/company.constants';

import { TbSeat } from '../../entities/seat.entity';

import { TbTrip } from '../../entities/trip.entity';

import { TbDriver } from '../../entities/driver.entity';
import { TbVerhical } from '../../entities/verhical.entity';

type CmsVehicalPayload = CreateVehicalPayloadDto | UpdateVehicalPayloadDto;

@Injectable()
export class CMSVerhicalService {
  constructor(
    private readonly vehicalService: VehicleService,

    private readonly seatService: SeatService,

    private readonly companyTripService: CompanyTripService,

    private readonly tripService: TripService,

    private readonly driverService: DriverService,
  ) {}

  public async getVehicalById(
    user: UserDecoratorDtoResponse,

    id: number,
  ): Promise<CmsVehicalDetailResponseDto> {
    const vehical = await this.vehicalService.findOne(user, id);

    return this.buildVehicalDetail(user, vehical);
  }

  public async getAllVehicals(
    user: UserDecoratorDtoResponse,

    companyId?: number,
  ): Promise<CmsVehicalListResponseDto> {
    const vehicals = await this.vehicalService.findAll(user, companyId);

    const items = await Promise.all(
      vehicals.map((v) => this.buildVehicalDetail(user, v)),
    );

    return { items, total: items.length };
  }

  public async createVehical(
    payload: CreateVehicalPayloadDto,
    user: UserDecoratorDtoResponse,
  ): Promise<VehicalResponseDto> {
    try {
      const vehical = await this.vehicalService.create(
        user,
        this.toCreateVehicleDto(payload),
      );

      const seats = await this.seatService.createBatch(user, {
        companyId: vehical.companyId,

        verhicalId: vehical.id,

        seats: this.buildSeatItems(payload.seatType, payload.seatCount, 0),
      });

      const companyTrip = await this.companyTripService.create(
        user,

        this.toCreateCompanyTripDto(vehical, payload, seats.length),
      );

      return this.toResponse(payload, vehical, seats, companyTrip);
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

  public async updateVehical(
    payload: UpdateVehicalPayloadDto,
    user: UserDecoratorDtoResponse,
  ): Promise<VehicalResponseDto> {
    try {
      const vehical = await this.vehicalService.update(
        user,

        payload.id,

        this.toUpdateVehicleDto(payload),
      );

      const seats = await this.syncSeatsForVehicle(user, vehical, payload);

      const companyTrip = await this.syncCompanyTripForVehicle(
        user,

        vehical,

        payload,

        seats.length,
      );

      return this.toResponse(payload, vehical, seats, companyTrip);
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

  public async deleteVehical(
    user: UserDecoratorDtoResponse,

    id: number,
  ): Promise<{
    message: string;

    vehicalId: number;

    seatsDeactivated: number;

    companyTripsDeactivated: number;
  }> {
    try {
      const vehical = await this.vehicalService.findOne(user, id);

      const seatResult = await this.seatService.removeAllByVehicle(
        user,

        vehical.companyId,

        vehical.id,
      );

      const tripResult = await this.companyTripService.removeAllByVehicle(
        user,

        vehical.companyId,

        vehical.id,
      );

      await this.vehicalService.remove(user, id);

      return {
        message: CmsVehicalSuccessMessage.DELETE_SUCCESS,

        vehicalId: id,

        seatsDeactivated: seatResult.deactivatedCount,

        companyTripsDeactivated: tripResult.deactivatedCount,
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

  private async syncCompanyTripForVehicle(
    user: UserDecoratorDtoResponse,

    vehical: TbVerhical,

    payload: UpdateVehicalPayloadDto,

    totalSeat: number,
  ): Promise<TbCompanyTrip> {
    const tripId = this.parsePositiveInt(
      payload.tripId,

      CmsVehicalValidationMessage.TRIP_ID_EMPTY,

      CmsVehicalValidationMessage.TRIP_ID_INVALID,
    );

    const driverId = this.parsePositiveInt(
      payload.driverId,

      CmsVehicalValidationMessage.DRIVER_ID_EMPTY,

      CmsVehicalValidationMessage.DRIVER_ID_INVALID,
    );

    const companyTripStatus =
      payload.vehicalStatus === EntityStatus.INACTIVE
        ? EntityStatus.INACTIVE
        : EntityStatus.ACTIVE;

    const trips = await this.companyTripService.findByVehicle(
      user,

      vehical.companyId,

      vehical.id,
    );

    let target = payload.companyTripId
      ? trips.find((t) => t.id === payload.companyTripId)
      : trips.find((t) => t.status === EntityStatus.ACTIVE);

    if (payload.companyTripId && !target) {
      throw new HttpException(
        CmsVehicalErrorMessage.COMPANY_TRIP_NOT_FOUND,

        HttpStatus.NOT_FOUND,
      );
    }

    const tripPayload: UpdateCompanyTripDto = {
      tripId,

      driverId,

      verhicalId: vehical.id,

      totalSeat,

      pricePerSeat: payload.pricePerSeat ?? 0,

      description: this.buildCompanyTripDescription(payload),

      status: companyTripStatus,
    };

    if (target) {
      if (target.totalSeatBooked > totalSeat) {
        throw new HttpException(
          CmsVehicalErrorMessage.SEAT_BOOKED_EXCEEDS_TOTAL,

          HttpStatus.BAD_REQUEST,
        );
      }

      return this.companyTripService.update(user, target.id, tripPayload);
    }

    return this.companyTripService.create(
      user,

      this.toCreateCompanyTripDto(vehical, payload, totalSeat),
    );
  }

  private async syncSeatsForVehicle(
    user: UserDecoratorDtoResponse,

    vehical: TbVerhical,

    payload: UpdateVehicalPayloadDto,
  ): Promise<TbSeat[]> {
    const targetCount = payload.seatCount;

    const allSeats = await this.seatService.findByVehicle(
      user,

      vehical.companyId,

      vehical.id,
    );

    let activeSeats = this.sortSeatsByOrdinalAsc(
      allSeats.filter((s) => s.status === EntityStatus.ACTIVE),
    );

    if (activeSeats.length === 0) {
      return this.seatService.createBatch(user, {
        companyId: vehical.companyId,

        verhicalId: vehical.id,

        seats: this.buildSeatItems(payload.seatType, targetCount, 0),
      });
    }

    if (targetCount > activeSeats.length) {
      const maxOrdinal = this.getMaxSeatOrdinal(activeSeats);

      const newSeats = await this.seatService.createBatch(user, {
        companyId: vehical.companyId,

        verhicalId: vehical.id,

        seats: this.buildSeatItems(
          payload.seatType,

          targetCount - activeSeats.length,

          maxOrdinal,
        ),
      });

      activeSeats = this.sortSeatsByOrdinalAsc([...activeSeats, ...newSeats]);
    } else if (targetCount < activeSeats.length) {
      const removeCount = activeSeats.length - targetCount;

      const toRemove = this.sortSeatsByOrdinalDesc(activeSeats).slice(
        0,

        removeCount,
      );

      for (const seat of toRemove) {
        await this.seatService.remove(user, seat.id, vehical.companyId);
      }

      const removedIds = new Set(toRemove.map((s) => s.id));

      activeSeats = activeSeats.filter((s) => !removedIds.has(s.id));

      activeSeats = this.sortSeatsByOrdinalAsc(activeSeats);
    }

    await this.refreshSeatLabels(user, vehical.companyId, activeSeats, payload);

    return activeSeats;
  }

  private toCreateVehicleDto(
    payload: CreateVehicalPayloadDto,
  ): CreateVehicleDto {
    return {
      name: payload.vehicalName,

      code:
        payload.vehicalCode?.trim() || generateEntityCode(CODE_PREFIX.VEHICLE),

      type: payload.vehicalType,

      status: payload.vehicalStatus,

      schedule: payload.schedule,

      description: this.buildVehicleDescription(payload),
    };
  }

  private toUpdateVehicleDto(
    payload: UpdateVehicalPayloadDto,
  ): UpdateVehicleDto {
    return {
      name: payload.vehicalName,

      code: payload.vehicalCode,

      type: payload.vehicalType,

      status: payload.vehicalStatus,

      schedule: payload.schedule,

      description: this.buildVehicleDescription(payload),
    };
  }

  private toCreateCompanyTripDto(
    vehical: TbVerhical,

    payload: CmsVehicalPayload,

    totalSeat: number,
  ): CreateCompanyTripDto {
    return {
      companyId: vehical.companyId,

      tripId: this.parsePositiveInt(
        payload.tripId,

        CmsVehicalValidationMessage.TRIP_ID_EMPTY,

        CmsVehicalValidationMessage.TRIP_ID_INVALID,
      ),

      verhicalId: vehical.id,

      driverId: this.parsePositiveInt(
        payload.driverId,

        CmsVehicalValidationMessage.DRIVER_ID_EMPTY,

        CmsVehicalValidationMessage.DRIVER_ID_INVALID,
      ),

      totalSeat,

      pricePerSeat: payload.pricePerSeat ?? 0,

      description: this.buildCompanyTripDescription(payload),

      status:
        payload.vehicalStatus === EntityStatus.INACTIVE
          ? EntityStatus.INACTIVE
          : EntityStatus.ACTIVE,
    };
  }

  private buildVehicleDescription(payload: CmsVehicalPayload): string {
    return `${payload.description} - ${payload.timeStart} - ${payload.timeEnd}`;
  }

  private buildCompanyTripDescription(payload: CmsVehicalPayload): string {
    return `${payload.description} | ${payload.schedule} | ${payload.timeStart}-${payload.timeEnd}`;
  }

  private parsePositiveInt(
    value: string,

    emptyMessage: string,

    invalidMessage: string,
  ): number {
    if (!validString(value)) {
      throw new HttpException(emptyMessage, HttpStatus.BAD_REQUEST);
    }

    const parsed = parseInt(value.trim(), 10);

    if (Number.isNaN(parsed) || parsed <= 0) {
      throw new HttpException(invalidMessage, HttpStatus.BAD_REQUEST);
    }

    return parsed;
  }

  private buildSeatName(seatType: string, ordinal: number): string {
    const prefix = seatType?.trim().charAt(0).toUpperCase() || 'S';

    return `${prefix}-${ordinal}`;
  }

  private buildSeatItems(
    seatType: string,

    count: number,

    startOffset: number,
  ): CreateSeatItemDto[] {
    return Array.from({ length: count }, (_, i) => {
      const n = startOffset + i + 1;

      return {
        name: this.buildSeatName(seatType, n),

        index: String(n),

        type: seatType,

        description: 'Ghế mặc định',
      };
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

  private getMaxSeatOrdinal(seats: TbSeat[]): number {
    return seats.reduce((max, s) => Math.max(max, this.getSeatOrdinal(s)), 0);
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

  private async refreshSeatLabels(
    user: UserDecoratorDtoResponse,

    companyId: number,

    seats: TbSeat[],

    payload: UpdateVehicalPayloadDto,
  ): Promise<void> {
    await Promise.all(
      seats.map((seat, i) => {
        const n = i + 1;

        return this.seatService.update(user, seat.id, companyId, {
          name: this.buildSeatName(payload.seatType, n),

          index: String(n),

          type: payload.seatType,

          description: seat.description ?? 'Ghế mặc định',
        });
      }),
    );
  }

  private async buildVehicalDetail(
    user: UserDecoratorDtoResponse,
    vehical: TbVerhical,
  ): Promise<CmsVehicalDetailResponseDto> {
    const [allSeats, companyTrips] = await Promise.all([
      this.seatService.findByVehicle(user, vehical.companyId, vehical.id),
      this.companyTripService.findByVehicle(
        user,
        vehical.companyId,
        vehical.id,
      ),
    ]);

    const sortedSeats = this.sortSeatsByOrdinalAsc(allSeats);
    const activeSeats = sortedSeats.filter(
      (s) => s.status === EntityStatus.ACTIVE,
    );
    const seatType = activeSeats[0]?.type ?? sortedSeats[0]?.type ?? '';
    const primaryCompanyTrip = this.pickPrimaryCompanyTrip(companyTrips);

    const [trip, driver] = await Promise.all([
      this.loadTripForDetail(user, primaryCompanyTrip),
      this.loadDriverForDetail(user, primaryCompanyTrip),
    ]);

    const meta = this.parseVehicleDescriptionMeta(vehical.description);

    return {
      verhical: this.toCmsVerhicalEntity(vehical, meta.description),
      seats: sortedSeats.map((s) => this.toCmsSeatResponse(s)),
      trip,
      driver,
      companyTrip: primaryCompanyTrip
        ? this.toCompanyTripResponse(primaryCompanyTrip)
        : null,
      companyTrips: companyTrips.map((t) => this.toCompanyTripResponse(t)),
      seatType,
      seatCount: activeSeats.length,
      tripId: primaryCompanyTrip ? String(primaryCompanyTrip.tripId) : '',
      driverId: primaryCompanyTrip ? String(primaryCompanyTrip.driverId) : '',
      companyTripId: primaryCompanyTrip?.id,
      pricePerSeat: primaryCompanyTrip
        ? Number(primaryCompanyTrip.pricePerSeat)
        : undefined,
      timeStart: meta.timeStart,
      timeEnd: meta.timeEnd,
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

  private parseVehicleDescriptionMeta(description?: string): {
    description: string;
    timeStart: string;
    timeEnd: string;
  } {
    const raw = description?.trim();
    if (!raw) {
      return { description: '', timeStart: '', timeEnd: '' };
    }
    const text = raw;
    const parts = text.split(' - ');
    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (
      parts.length >= 3 &&
      timePattern.test(parts[parts.length - 1]) &&
      timePattern.test(parts[parts.length - 2])
    ) {
      const timeEnd = parts.pop()!;
      const timeStart = parts.pop()!;
      return {
        description: parts.join(' - '),
        timeStart,
        timeEnd,
      };
    }
    return { description: text, timeStart: '', timeEnd: '' };
  }

  private toCmsVerhicalEntity(
    vehical: TbVerhical,
    plainDescription?: string,
  ): CmsVerhicalEntityDto {
    return {
      id: vehical.id,
      companyId: vehical.companyId,
      code: vehical.code,
      name: vehical.name,
      type: vehical.type,
      status: vehical.status,
      description: plainDescription ?? vehical.description ?? undefined,
      image: vehical.image ?? undefined,
    };
  }

  private toCmsSeatResponse(seat: TbSeat): CmsSeatResponseDto {
    return {
      id: seat.id,
      verhicalId: seat.verhicalId,
      code: seat.code,
      name: seat.name,
      index: seat.index,
      type: seat.type,
      status: seat.status,
      description: seat.description ?? undefined,
      createdAt: seat.createdAt?.toISOString?.() ?? String(seat.createdAt),
      updatedAt: seat.updatedAt?.toISOString?.() ?? String(seat.updatedAt),
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

  private toResponse(
    payload: CmsVehicalPayload,

    vehical: TbVerhical,

    seats: TbSeat[],

    companyTrip: TbCompanyTrip,
  ): VehicalResponseDto {
    return {
      id: String(vehical.id),

      name: vehical.name,

      code: vehical.code,

      seatType: seats[0]?.type ?? payload.seatType,

      seatCount: seats.length,

      vehicalType: vehical.type,

      vehicalStatus: vehical.status,

      tripId: payload.tripId,

      driverId: payload.driverId,

      companyTripId: companyTrip.id,

      companyTrip: this.toCompanyTripResponse(companyTrip),

      pricePerSeat: Number(companyTrip.pricePerSeat),

      schedule: vehical.schedule ?? payload.schedule,

      description: vehical.description ?? payload.description,

      timeStart: payload.timeStart,

      timeEnd: payload.timeEnd,

      createdAt: new Date().toISOString(),

      updatedAt: new Date().toISOString(),
    };
  }
}
