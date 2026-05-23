import { Injectable, NotFoundException } from '@nestjs/common';
import { CompanyErrorMessage } from '../assets/messages/company.message';
import { TbRoad } from '../entities/road.entity';
import { RoadRepository } from '../repositories/road.repository';
import {
  CODE_PREFIX,
  EntityStatus,
} from '../assets/constants/company.constants';
import { generateEntityCode } from '../common/helpers/common.helper';
import { CreateRoadDto, UpdateRoadDto } from '../dtos/company/company.dto';
import { UserDecoratorDtoResponse } from '../dtos/user/common.dto';
import { CompanyAccessService } from './company-access.service';

@Injectable()
export class RoadService {
  constructor(
    private readonly roadRepository: RoadRepository,
    private readonly companyAccess: CompanyAccessService,
  ) {}

  async create(
    user: UserDecoratorDtoResponse,
    payload: CreateRoadDto,
  ): Promise<TbRoad> {
    await this.companyAccess.assertCompanyAccess(user, payload.companyId);
    return this.roadRepository.save({
      companyId: payload.companyId,
      code: payload.code?.trim() || generateEntityCode(CODE_PREFIX.ROAD),
      name: payload.name,
      length: payload.length,
      type: payload.type,
      startPoint: payload.startPoint,
      endPoint: payload.endPoint,
      startTime: payload.startTime,
      endTime: payload.endTime,
      status: payload.status ?? EntityStatus.ACTIVE,
      totalTurn: 0,
    });
  }

  async findAll(
    user: UserDecoratorDtoResponse,
    companyId?: number,
  ): Promise<TbRoad[]> {
    const resolvedCompanyId = await this.companyAccess.resolveCompanyIdForUser(
      user,
      companyId,
    );
    await this.companyAccess.assertCompanyAccess(user, resolvedCompanyId);
    return this.roadRepository.findByCompany(resolvedCompanyId);
  }

  async findOne(
    user: UserDecoratorDtoResponse,
    id: number,
  ): Promise<TbRoad> {
    const road = await this.roadRepository.findById(id);
    if (!road) {
      throw new NotFoundException(CompanyErrorMessage.ROAD_NOT_FOUND);
    }
    await this.companyAccess.assertCompanyAccess(user, road.companyId);
    return road;
  }

  async update(
    user: UserDecoratorDtoResponse,
    id: number,
    payload: UpdateRoadDto,
  ): Promise<TbRoad> {
    await this.findOne(user, id);
    await this.roadRepository.update(id, payload);
    return this.findOne(user, id);
  }

  async remove(
    user: UserDecoratorDtoResponse,
    id: number,
  ): Promise<{ message: string }> {
    await this.findOne(user, id);
    await this.roadRepository.update(id, { status: EntityStatus.INACTIVE });
    return { message: 'Đã vô hiệu hóa tuyến đường' };
  }
}
