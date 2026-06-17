import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TbCompanyRegistration } from '../entities/company-registration.entity';
import { RegistrationStatus } from '../entities/company-registration.entity';

@Injectable()
export class CompanyRegistrationRepository {
  constructor(
    @InjectRepository(TbCompanyRegistration)
    private readonly repo: Repository<TbCompanyRegistration>,
  ) {}

  async create(data: Partial<TbCompanyRegistration>) {
    return this.repo.save(this.repo.create(data));
  }

  async findPendingByUserId(userId: number) {
    return this.repo.findOne({
      where: { userId, status: RegistrationStatus.PENDING },
      order: { id: 'DESC' },
    });
  }

  async findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async findAll(filter?: { status?: string; userId?: number }) {
    const where: Record<string, unknown> = {};
    if (filter?.status) {
      where.status = filter.status as RegistrationStatus;
    }
    if (filter?.userId) {
      where.userId = filter.userId;
    }
    return this.repo.find({ where, order: { id: 'DESC' } });
  }

  async updateStatus(id: number, data: Partial<TbCompanyRegistration>) {
    await this.repo.update({ id }, data);
    return this.findById(id);
  }
}
