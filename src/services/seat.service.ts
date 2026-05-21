import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TbSeat } from '../entities/seat.entity';
import { SeatRepository } from '../repositories/seat.repository';
import { VehicleRepository } from '../repositories/vehicle.repository';
import {
  CODE_PREFIX,
  EntityStatus,
} from '../assets/constants/company.constants';
import { CompanyErrorMessage } from '../assets/messages/company.message';
import { generateEntityCode } from '../common/helpers/common.helper';
import {
  CreateSeatDto,
  CreateSeatsBatchDto,
} from '../dtos/company/company.dto';
import { UpdateSeatDto } from '../dtos/transport/ticket.dto';
import { UserDecoratorDtoResponse } from '../dtos/user/common.dto';
import { CompanyAccessService } from './company-access.service';

@Injectable()
export class SeatService {
  constructor(
    private readonly seatRepository: SeatRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly companyAccess: CompanyAccessService,
  ) {}

  async create(
    user: UserDecoratorDtoResponse,
    payload: CreateSeatDto,
  ): Promise<TbSeat> {
    await this.companyAccess.assertCompanyAccess(user, payload.companyId);
    await this.companyAccess.assertVehicleBelongsToCompany(
      payload.companyId,
      payload.verhicalId,
    );

    return this.seatRepository.save({
      verhicalId: payload.verhicalId,
      code: generateEntityCode(CODE_PREFIX.SEAT),
      name: payload.name,
      index: payload.index,
      type: payload.type,
      status: payload.status ?? EntityStatus.ACTIVE,
      description: payload.description ?? undefined,
    });
  }

  async createBatch(
    user: UserDecoratorDtoResponse,
    payload: CreateSeatsBatchDto,
  ): Promise<TbSeat[]> {
    await this.companyAccess.assertCompanyAccess(user, payload.companyId);
    await this.companyAccess.assertVehicleBelongsToCompany(
      payload.companyId,
      payload.verhicalId,
    );

    if (!payload.seats?.length) {
      throw new HttpException(
        CompanyErrorMessage.INVALID_REFERENCE,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.seatRepository.saveMany(
      payload.seats.map((seat) => ({
        verhicalId: payload.verhicalId,
        code: generateEntityCode(CODE_PREFIX.SEAT),
        name: seat.name,
        index: seat.index,
        type: seat.type,
        status: seat.status ?? EntityStatus.ACTIVE,
        description: seat.description ?? undefined,
      })),
    );
  }

  async findByVehicle(
    user: UserDecoratorDtoResponse,
    companyId: number,
    verhicalId: number,
  ): Promise<TbSeat[]> {
    await this.companyAccess.assertCompanyAccess(user, companyId);
    await this.companyAccess.assertVehicleBelongsToCompany(
      companyId,
      verhicalId,
    );
    return this.seatRepository.findByVehicle(verhicalId);
  }

  async findOne(
    user: UserDecoratorDtoResponse,
    id: number,
  ): Promise<TbSeat> {
    const seat = await this.seatRepository.findById(id);
    if (!seat) {
      throw new NotFoundException(CompanyErrorMessage.SEAT_NOT_FOUND);
    }
    const vehicle = await this.vehicleRepository.findById(seat.verhicalId);
    if (!vehicle) {
      throw new NotFoundException(CompanyErrorMessage.VEHICLE_NOT_FOUND);
    }
    await this.companyAccess.assertCompanyAccess(user, vehicle.companyId);
    return seat;
  }

  async update(
    user: UserDecoratorDtoResponse,
    id: number,
    companyId: number,
    payload: UpdateSeatDto,
  ): Promise<TbSeat> {
    await this.companyAccess.assertSeatBelongsToCompany(companyId, id);
    await this.companyAccess.assertCompanyAccess(user, companyId);
    await this.seatRepository.update(id, payload);
    const seat = await this.seatRepository.findById(id);
    if (!seat) {
      throw new NotFoundException(CompanyErrorMessage.SEAT_NOT_FOUND);
    }
    return seat;
  }

  async remove(
    user: UserDecoratorDtoResponse,
    id: number,
    companyId: number,
  ): Promise<{ message: string }> {
    await this.companyAccess.assertSeatBelongsToCompany(companyId, id);
    await this.companyAccess.assertCompanyAccess(user, companyId);
    await this.seatRepository.update(id, { status: EntityStatus.INACTIVE });
    return { message: 'Đã vô hiệu hóa ghế' };
  }

  /** Vô hiệu hóa toàn bộ ghế thuộc một phương tiện (kể cả đang ACTIVE). */
  async removeAllByVehicle(
    user: UserDecoratorDtoResponse,
    companyId: number,
    verhicalId: number,
  ): Promise<{ message: string; deactivatedCount: number }> {
    await this.companyAccess.assertCompanyAccess(user, companyId);
    await this.companyAccess.assertVehicleBelongsToCompany(
      companyId,
      verhicalId,
    );

    const seats = await this.seatRepository.findByVehicle(verhicalId);
    const activeCount = seats.filter(
      (s) => s.status === EntityStatus.ACTIVE,
    ).length;

    if (seats.length > 0) {
      await this.seatRepository.deactivateByVehicleId(verhicalId);
    }

    return {
      message: 'Đã vô hiệu hóa tất cả ghế của phương tiện',
      deactivatedCount: activeCount > 0 ? activeCount : seats.length,
    };
  }
}
