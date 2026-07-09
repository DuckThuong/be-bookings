import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt/jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { MasterDataService } from '../services/master-data.service';
import { MasterDataDtoPayload, MasterDataAllResponseDto } from '../dtos/master-data.dto';
import { TbMasterData } from '../entities/master-data.entity';
import { MasterDataType } from '../assets/constants/company.constants';

@Controller('master-data')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MasterDataController {
  constructor(private readonly masterDataService: MasterDataService) {}

  @Get('find-by-type')
  public async findDataByType(
    @Query() payload: MasterDataDtoPayload,
  ): Promise<TbMasterData[] | []> {
    return this.masterDataService.findDataByType(payload);
  }

  @Get('find-by-code')
  public async findDataByCode(
    @Query() payload: MasterDataDtoPayload,
  ): Promise<TbMasterData[] | []> {
    return this.masterDataService.findDataByCode(payload);
  }

  @Get('find-by-type-and-code')
  public async findDataByTypeAndCode(
    @Query() payload: MasterDataDtoPayload,
  ): Promise<TbMasterData[] | []> {
    return this.masterDataService.findDataByTypeAndCode(payload);
  }

  @Get('all-statuses')
  public async getAllStatuses(): Promise<MasterDataAllResponseDto> {
    return this.masterDataService.getAllStatuses();
  }

  @Get('by-types')
  public async getByTypes(
    @Query('types') types: string,
  ): Promise<Record<string, TbMasterData[]>> {
    const typeList = types ? types.split(',') : [];
    return this.masterDataService.getByTypes(typeList);
  }
}
