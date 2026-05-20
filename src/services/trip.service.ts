import { Injectable, NotFoundException } from '@nestjs/common';
import { CompanyErrorMessage } from '../assets/messages/company.message';
import { TbTrip } from '../entities/trip.entity';
import { TripRepository } from '../repositories/trip.repository';
import { RoadRepository } from '../repositories/road.repository';
import {
  CODE_PREFIX,
  EntityStatus,
} from '../assets/constants/company.constants';
import { generateEntityCode } from '../common/helpers/common.helper';
import { CreateTripDto, UpdateTripDto } from '../dtos/company/company.dto';
import { UserDecoratorDtoResponse } from '../dtos/user/common.dto';
import { CompanyAccessService } from './company-access.service';

@Injectable()
export class TripService {
  constructor(
    private readonly tripRepository: TripRepository,
    private readonly roadRepository: RoadRepository,
    private readonly companyAccess: CompanyAccessService,
  ) {}

  async create(
    user: UserDecoratorDtoResponse,
    payload: CreateTripDto,
  ): Promise<TbTrip> {
    const roadEntity = await this.roadRepository.findById(payload.roadId);
    if (!roadEntity) {
      throw new NotFoundException(CompanyErrorMessage.ROAD_NOT_FOUND);
    }
    const road = await this.companyAccess.assertRoadBelongsToCompany(
      roadEntity.companyId,
      payload.roadId,
    );
    await this.companyAccess.assertCompanyAccess(user, road.companyId);

    const trip = await this.tripRepository.save({
      code: generateEntityCode(CODE_PREFIX.TRIP),
      name: payload.name,
      roadId: payload.roadId,
      description: payload.description ?? undefined,
      status: payload.status ?? EntityStatus.ACTIVE,
    });

    await this.roadRepository.update(payload.roadId, {
      totalTurn: road.totalTurn + 1,
    });

    return trip;
  }

  async findAll(
    user: UserDecoratorDtoResponse,
    companyId: number,
  ): Promise<TbTrip[]> {
    await this.companyAccess.assertCompanyAccess(user, companyId);
    const roads = await this.roadRepository.findByCompany(companyId);
    return this.tripRepository.findByRoadIds(roads.map((r) => r.id));
  }

  async findByRoad(
    user: UserDecoratorDtoResponse,
    roadId: number,
  ): Promise<TbTrip[]> {
    const road = await this.roadRepository.findById(roadId);
    if (!road) {
      throw new NotFoundException(CompanyErrorMessage.ROAD_NOT_FOUND);
    }
    await this.companyAccess.assertCompanyAccess(user, road.companyId);
    return this.tripRepository.findByRoadId(roadId);
  }

  async findOne(
    user: UserDecoratorDtoResponse,
    id: number,
  ): Promise<TbTrip> {
    const trip = await this.tripRepository.findById(id);
    if (!trip) {
      throw new NotFoundException(CompanyErrorMessage.TRIP_NOT_FOUND);
    }
    const road = await this.roadRepository.findById(trip.roadId);
    if (!road) {
      throw new NotFoundException(CompanyErrorMessage.ROAD_NOT_FOUND);
    }
    await this.companyAccess.assertCompanyAccess(user, road.companyId);
    return trip;
  }

  async update(
    user: UserDecoratorDtoResponse,
    id: number,
    payload: UpdateTripDto,
  ): Promise<TbTrip> {
    await this.findOne(user, id);
    if (payload.roadId !== undefined) {
      const road = await this.roadRepository.findById(payload.roadId);
      if (!road) {
        throw new NotFoundException(CompanyErrorMessage.ROAD_NOT_FOUND);
      }
      await this.companyAccess.assertCompanyAccess(user, road.companyId);
    }
    await this.tripRepository.update(id, payload);
    return this.findOne(user, id);
  }

  async remove(
    user: UserDecoratorDtoResponse,
    id: number,
  ): Promise<{ message: string }> {
    await this.findOne(user, id);
    await this.tripRepository.update(id, { status: EntityStatus.INACTIVE });
    return { message: 'Đã vô hiệu hóa chuyến xe' };
  }
}
