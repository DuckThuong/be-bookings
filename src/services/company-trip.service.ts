import { Injectable, NotFoundException } from '@nestjs/common';
import { TbCompanyTrip } from '../entities/company/company-trip.entity';
import { CompanyTripRepository } from '../repositories/company-trip.repository';
import { EntityStatus } from '../assets/constants/company.constants';
import { CompanyErrorMessage } from '../assets/messages/company.message';
import {
  CreateCompanyTripDto,
  UpdateCompanyTripDto,
} from '../dtos/company/company.dto';
import { UserDecoratorDtoResponse } from '../dtos/user/common.dto';
import { CompanyAccessService } from './company-access.service';

@Injectable()
export class CompanyTripService {
  constructor(
    private readonly companyTripRepository: CompanyTripRepository,
    private readonly companyAccess: CompanyAccessService,
  ) {}

  async create(
    user: UserDecoratorDtoResponse,
    payload: CreateCompanyTripDto,
  ): Promise<TbCompanyTrip> {
    await this.companyAccess.assertCompanyAccess(user, payload.companyId);
    await this.companyAccess.assertTripBelongsToCompany(
      payload.companyId,
      payload.tripId,
    );
    await this.companyAccess.assertVehicleBelongsToCompany(
      payload.companyId,
      payload.verhicalId,
    );
    await this.companyAccess.assertDriverBelongsToCompany(
      payload.companyId,
      payload.driverId,
    );

    return this.companyTripRepository.save({
      companyId: payload.companyId,
      tripId: payload.tripId,
      verhicalId: payload.verhicalId,
      driverId: payload.driverId,
      description: payload.description ?? '',
      totalSeat: payload.totalSeat,
      totalSeatBooked: 0,
      totalPrice: 0,
      pricePerSeat: payload.pricePerSeat,
      status: payload.status ?? EntityStatus.ACTIVE,
    });
  }

  async findAll(
    user: UserDecoratorDtoResponse,
    companyId: number,
  ): Promise<TbCompanyTrip[]> {
    await this.companyAccess.assertCompanyAccess(user, companyId);
    return this.companyTripRepository.findByCompany(companyId);
  }

  async findOne(
    user: UserDecoratorDtoResponse,
    id: number,
  ): Promise<TbCompanyTrip> {
    const companyTrip = await this.companyTripRepository.findById(id);
    if (!companyTrip) {
      throw new NotFoundException(CompanyErrorMessage.COMPANY_TRIP_NOT_FOUND);
    }
    await this.companyAccess.assertCompanyAccess(user, companyTrip.companyId);
    return companyTrip;
  }

  async update(
    user: UserDecoratorDtoResponse,
    id: number,
    payload: UpdateCompanyTripDto,
  ): Promise<TbCompanyTrip> {
    const current = await this.findOne(user, id);

    if (payload.tripId !== undefined) {
      await this.companyAccess.assertTripBelongsToCompany(
        current.companyId,
        payload.tripId,
      );
    }
    if (payload.verhicalId !== undefined) {
      await this.companyAccess.assertVehicleBelongsToCompany(
        current.companyId,
        payload.verhicalId,
      );
    }
    if (payload.driverId !== undefined) {
      await this.companyAccess.assertDriverBelongsToCompany(
        current.companyId,
        payload.driverId,
      );
    }

    await this.companyTripRepository.update(id, payload);
    return this.findOne(user, id);
  }

  async remove(
    user: UserDecoratorDtoResponse,
    id: number,
  ): Promise<{ message: string }> {
    await this.findOne(user, id);
    await this.companyTripRepository.update(id, {
      status: EntityStatus.INACTIVE,
    });
    return { message: 'Đã vô hiệu hóa chuyến nhà xe' };
  }

  async findByVehicle(
    user: UserDecoratorDtoResponse,
    companyId: number,
    verhicalId: number,
  ): Promise<TbCompanyTrip[]> {
    await this.companyAccess.assertCompanyAccess(user, companyId);
    await this.companyAccess.assertVehicleBelongsToCompany(
      companyId,
      verhicalId,
    );
    return this.companyTripRepository.findByVerhicalId(verhicalId);
  }

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

    const trips = await this.companyTripRepository.findByVerhicalId(verhicalId);
    const activeCount = trips.filter(
      (t) => t.status === EntityStatus.ACTIVE,
    ).length;

    if (trips.length > 0) {
      await this.companyTripRepository.deactivateByVerhicalId(verhicalId);
    }

    return {
      message: 'Đã vô hiệu hóa tất cả chuyến khai thác của phương tiện',
      deactivatedCount: activeCount > 0 ? activeCount : trips.length,
    };
  }
}
