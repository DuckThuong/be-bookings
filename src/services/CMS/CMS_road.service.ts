import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { RoadService } from '../road.service';
import { CompanyAccessService } from '../company-access.service';
import { CommonErrorMessage } from '../../assets/messages/common.message';
import {
  CmsRoadSuccessMessage,
  CmsRoadValidationMessage,
} from '../../assets/messages/cms-road.message';
import {
  CreateRoadPayloadDto,
  UpdateRoadPayloadDto,
  RoadResponseDto,
  CmsRoadDetailResponseDto,
  CmsRoadEntityDto,
  CmsRoadListResponseDto,
} from '../../dtos/CMS/CMS_road.dto';
import { TbRoad } from '../../entities/road.entity';
import { UserDecoratorDtoResponse } from '../../dtos/user/common.dto';

@Injectable()
export class CMSRoadService {
  constructor(
    private readonly roadService: RoadService,
    private readonly companyAccess: CompanyAccessService,
  ) {}

  async getRoadById(
    user: UserDecoratorDtoResponse,
    id: number,
  ): Promise<CmsRoadDetailResponseDto> {
    return this.toResponse(await this.roadService.findOne(user, id));
  }

  async getAllRoads(
    user: UserDecoratorDtoResponse,
    companyId?: number,
  ): Promise<CmsRoadListResponseDto> {
    const roads = await this.roadService.findAll(user, companyId);
    const items = roads.map((road) => this.toResponse(road));
    return { items, total: items.length };
  }

  async createRoad(
    payload: CreateRoadPayloadDto,
    user: UserDecoratorDtoResponse,
  ): Promise<RoadResponseDto> {
    try {
      const companyId = await this.companyAccess.resolveCompanyIdForUser(
        user,
        payload.companyId,
      );
      const [startPoint, endPoint] = payload.name.split(/\s*-\s*/);
      const road = await this.roadService.create(user, {
        companyId,
        code: payload.code?.trim(),
        name: payload.name.trim(),
        length: payload.length,
        startPoint: startPoint?.trim() || '',
        endPoint: endPoint?.trim() || '',
        pickUpPoint: payload.pickUpPoint.trim(),
        dropOffPoint: payload.dropOffPoint.trim(),
        status: payload.status,
        totalTurn: payload.totalTurn ?? 0,
        standardDuration: payload.standardDuration?.trim() ?? '',
        tripsPerDay: payload.tripsPerDay ?? 0,
        averageOccupancy: payload.averageOccupancy ?? 0,
        estimatedRevenue: payload.estimatedRevenue ?? 0,
        leadVehicle: payload.leadVehicle?.trim() || null,
        demandLevel: payload.demandLevel?.trim() || null,
        note: payload.note?.trim() || null,
      });
      return this.toResponse(road);
    } catch (error) {
      this.rethrow(error);
    }
  }

  async updateRoad(
    payload: UpdateRoadPayloadDto,
    user: UserDecoratorDtoResponse,
  ): Promise<RoadResponseDto> {
    try {
      if (!payload.id) {
        throw new BadRequestException(CmsRoadValidationMessage.ROAD_ID_INVALID);
      }

      const updatePayload = this.toRoadUpdatePayload(payload);
      const road =
        Object.keys(updatePayload).length > 0
          ? await this.roadService.update(user, payload.id, updatePayload)
          : await this.roadService.findOne(user, payload.id);
      return this.toResponse(road);
    } catch (error) {
      this.rethrow(error);
    }
  }

  async deleteRoad(
    user: UserDecoratorDtoResponse,
    id: number,
  ): Promise<{ message: string; roadId: number }> {
    try {
      await this.roadService.remove(user, id);
      return {
        message: CmsRoadSuccessMessage.DELETE_SUCCESS,
        roadId: id,
      };
    } catch (error) {
      this.rethrow(error);
    }
  }

  private toResponse(road: TbRoad): CmsRoadEntityDto {
    return {
      id: road.id,
      companyId: road.companyId,
      code: road.code,
      name: road.name,
      length: Number(road.length),
      status: road.status,
      startPoint: road.startPoint,
      endPoint: road.endPoint,
      pickUpPoint: road.pickUpPoint,
      dropOffPoint: road.dropOffPoint,
      standardDuration: road.standardDuration ?? '',
      tripsPerDay: road.tripsPerDay ?? 0,
      averageOccupancy: Number(road.averageOccupancy ?? 0),
      estimatedRevenue: Number(road.estimatedRevenue ?? 0),
      leadVehicle: road.leadVehicle,
      demandLevel: road.demandLevel,
      note: road.note,
      totalTurn: road.totalTurn ?? 0,
    };
  }

  private toRoadUpdatePayload(payload: UpdateRoadPayloadDto): Partial<TbRoad> {
    const [startPoint, endPoint] = payload.name?.split(/\s*-\s*/) ?? [];
    return {
      ...(payload.name !== undefined
        ? {
            name: payload.name.trim(),
            startPoint: startPoint?.trim() || '',
            endPoint: endPoint?.trim() || '',
          }
        : {}),
      ...(payload.length !== undefined ? { length: payload.length } : {}),
      ...(payload.pickUpPoint !== undefined
        ? { pickUpPoint: payload.pickUpPoint.trim() }
        : {}),
      ...(payload.dropOffPoint !== undefined
        ? { dropOffPoint: payload.dropOffPoint.trim() }
        : {}),
      ...(payload.status !== undefined ? { status: payload.status } : {}),
      ...(payload.totalTurn !== undefined
        ? { totalTurn: payload.totalTurn }
        : {}),
      ...(payload.standardDuration !== undefined
        ? { standardDuration: payload.standardDuration?.trim() ?? '' }
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
        ? { leadVehicle: payload.leadVehicle?.trim() || null }
        : {}),
      ...(payload.demandLevel !== undefined
        ? { demandLevel: payload.demandLevel?.trim() || null }
        : {}),
      ...(payload.note !== undefined
        ? { note: payload.note?.trim() || null }
        : {}),
    };
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
