import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TbBasicUser } from '../entities/user/basic-user.entity';
import { TbInfoUser } from '../entities/user/info-user.entity';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(TbBasicUser)
    private readonly repo: Repository<TbBasicUser>,

    @InjectRepository(TbInfoUser)
    private readonly infoRepo: Repository<TbInfoUser>,
  ) {}

  public async findByPhone(phone: string) {
    return await this.repo.findOne({
      where: { phone },
    });
  }

  public async findByEmail(email: string) {
    return await this.repo.findOne({
      where: { email },
    });
  }

  public async createUser(userData: Partial<TbBasicUser>) {
    const user = this.repo.create(userData);
    return await this.repo.save(user);
  }

  public async createInfoUser(infoUserData: Partial<TbInfoUser>) {
    const infoUser = this.infoRepo.create(infoUserData);
    return await this.infoRepo.save(infoUser);
  }

  public async verifyEmail(email: string): Promise<void> {
    await this.repo.update({ email }, { isEmailVerified: true });
  }

  public async updatePassword(id: number, password: string): Promise<void> {
    await this.repo.update({ id }, { password: password });
  }
}
