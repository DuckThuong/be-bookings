import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

    const existing = await this.roadRepository.findByRouteIdentity(
      payload.companyId,
      payload.name,
      payload.startPoint,
      payload.endPoint,
    );

    if (existing) {
      return existing;
    }

    try {
      return await this.roadRepository.save({
        companyId: payload.companyId,
        code: payload.code?.trim() || generateEntityCode(CODE_PREFIX.ROAD),
        name: payload.name,
        length: payload.length,
        startPoint: payload.startPoint,
        endPoint: payload.endPoint,
        status: payload.status ?? EntityStatus.ACTIVE,
        totalTurn: payload.totalTurn ?? 0,
        standardDuration: payload.standardDuration ?? '',
        tripsPerDay: payload.tripsPerDay ?? 0,
        averageOccupancy: payload.averageOccupancy ?? 0,
        estimatedRevenue: payload.estimatedRevenue ?? 0,
        leadVehicle: payload.leadVehicle ?? null,
        demandLevel: payload.demandLevel ?? null,
        note: payload.note ?? null,
      });
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(CompanyErrorMessage.CODE_CONFLICT);
      }
      throw error;
    }
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
    const updatePayload: Partial<TbRoad> = {
      ...(payload.name !== undefined ? { name: payload.name } : {}),
      ...(payload.length !== undefined ? { length: payload.length } : {}),
      ...(payload.startPoint !== undefined
        ? { startPoint: payload.startPoint }
        : {}),
      ...(payload.endPoint !== undefined ? { endPoint: payload.endPoint } : {}),
      ...(payload.status !== undefined ? { status: payload.status } : {}),
      ...(payload.totalTurn !== undefined
        ? { totalTurn: payload.totalTurn }
        : {}),
      ...(payload.standardDuration !== undefined
        ? { standardDuration: payload.standardDuration }
        : {}),
      ...(payload.tripsPerDay !== undefined
        ? { tripsPerDay: payload.tripsPerDay }
        : {}),
      ...(payload.averageOccupancy !== undefined
        ? { averageOccupancy: payload.averageOccupancy }
        : {}),
      ...(payload.estimatedRevenue !== undefined
        ? { estimatedRevenue: payload.estimatedRevenue }
        : {}),
      ...(payload.leadVehicle !== undefined
        ? { leadVehicle: payload.leadVehicle }
        : {}),
      ...(payload.demandLevel !== undefined
        ? { demandLevel: payload.demandLevel }
        : {}),
      ...(payload.note !== undefined ? { note: payload.note } : {}),
    };

    if (Object.keys(updatePayload).length > 0) {
      await this.roadRepository.update(id, updatePayload);
    }
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

  private isDuplicateKeyError(error: unknown): boolean {
    const maybeError = error as { code?: string; errno?: number };
    return maybeError.code === 'ER_DUP_ENTRY' || maybeError.errno === 1062;
  }
}
