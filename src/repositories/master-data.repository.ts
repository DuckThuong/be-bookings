import { Injectable } from '@nestjs/common';
import { TbMasterData } from '../entities/master-data.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MasterDataDtoPayload } from '../dtos/master-data.dto';

@Injectable()
export class MasterDataRepository {
  constructor(
    @InjectRepository(TbMasterData)
    private readonly repo: Repository<TbMasterData>,
  ) {}

  public async findDataByType(
    type: MasterDataDtoPayload['type'],
  ): Promise<TbMasterData[] | null> {
    const data = await this.repo.find({
      where: { type },
      order: { sort: 'ASC' },
    });
    return data.length > 0 ? data : null;
  }

  public async findDataByCode(
    code: MasterDataDtoPayload['code'],
  ): Promise<TbMasterData[] | null> {
    const data = await this.repo.find({
      where: { code },
      order: { sort: 'ASC' },
    });
    return data.length > 0 ? data : null;
  }

  public async findDataByTypeAndCode(
    type: MasterDataDtoPayload['type'],
    code: MasterDataDtoPayload['code'],
  ): Promise<TbMasterData[] | null> {
    const data = await this.repo.find({
      where: { type, code },
      order: { sort: 'ASC' },
    });
    return data.length > 0 ? data : null;
  }
}
