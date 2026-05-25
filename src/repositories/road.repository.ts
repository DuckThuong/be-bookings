import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TbRoad } from '../entities/road.entity';
import { EntityStatus } from '../assets/constants/company.constants';

@Injectable()
export class RoadRepository {
  constructor(
    @InjectRepository(TbRoad)
    private readonly repo: Repository<TbRoad>,
  ) {}

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  findByCodeAndCompany(code: string, companyId: number) {
    return this.repo.findOne({ where: { code, companyId } });
  }

  findByNameAndCompany(name: string, companyId: number) {
    return this.repo.findOne({ where: { name, companyId } });
  }

  findByRouteIdentity(
    companyId: number,
    name: string,
    startPoint: string,
    endPoint: string,
  ) {
    return this.repo.findOne({
      where: {
        companyId,
        name,
        startPoint,
        endPoint,
      },
    });
  }

  findByCompany(companyId: number) {
    return this.repo.find({ where: { companyId }, order: { id: 'DESC' } });
  }

  save(data: Partial<TbRoad>) {
    return this.repo.save(this.repo.create(data));
  }

  update(id: number, data: Partial<TbRoad>) {
    return this.repo.update({ id }, data);
  }

  countActiveByCompany(companyId: number) {
    return this.repo.count({
      where: { companyId, status: EntityStatus.ACTIVE },
    });
  }
}
