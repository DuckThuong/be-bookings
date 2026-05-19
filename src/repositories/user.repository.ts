import { Injectable } from '@nestjs/common';
import { FindOptionsWhere, In, Like, Repository } from 'typeorm';
import { TbBasicUser } from '../entities/user/basic-user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TbInfoUser } from '../entities/user/info-user.entity';
import {
  AdminUpdateUserPayloadDto,
  UpdateUserPayloadDto,
  UserFilterPayloadDto,
  UserInformationResponseDto,
} from '../dtos/user/user.dto';
import {
  mapToUserInformationResponse,
  mergeUserInformationList,
} from '../common/helpers/user.helper';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(TbBasicUser)
    private readonly repo: Repository<TbBasicUser>,

    @InjectRepository(TbInfoUser)
    private readonly infoRepo: Repository<TbInfoUser>,
  ) {}

  public async findUserById(
    userId: number,
  ): Promise<UserInformationResponseDto | null> {
    const basic = await this.repo.findOne({ where: { id: userId } });
    if (!basic) {
      return null;
    }

    const info = await this.infoRepo.findOne({
      where: { userCode: basic.userCode },
    });
    if (!info) {
      return null;
    }

    return mapToUserInformationResponse(basic, info);
  }

  public async findAllUsers(): Promise<UserInformationResponseDto[]> {
    const basicUsers = await this.repo.find();
    return this.loadMergedUsers(basicUsers);
  }

  public async findUsersByFilter(
    filter: UserFilterPayloadDto,
  ): Promise<UserInformationResponseDto[]> {
    const basicWhere = this.buildBasicWhere(filter);
    const infoWhere = this.buildInfoWhere(filter);
    const hasBasicFilter = Object.keys(basicWhere).length > 0;
    const hasInfoFilter = Object.keys(infoWhere).length > 0;

    if (!hasBasicFilter && !hasInfoFilter) {
      return this.findAllUsers();
    }

    if (hasBasicFilter && hasInfoFilter) {
      const basicUsers = await this.repo.find({ where: basicWhere });
      if (basicUsers.length === 0) {
        return [];
      }

      const infoUsers = await this.infoRepo.find({ where: infoWhere });
      const basicCodes = new Set(basicUsers.map((basic) => basic.userCode));

      return mergeUserInformationList(
        basicUsers,
        infoUsers.filter((info) => basicCodes.has(info.userCode)),
      );
    }

    if (hasBasicFilter) {
      const basicUsers = await this.repo.find({ where: basicWhere });
      return this.loadMergedUsers(basicUsers);
    }

    const infoUsers = await this.infoRepo.find({ where: infoWhere });
    if (infoUsers.length === 0) {
      return [];
    }

    const basicUsers = await this.repo.find({
      where: { userCode: In(infoUsers.map((info) => info.userCode)) },
    });

    return mergeUserInformationList(basicUsers, infoUsers);
  }

  public async findAllUserByUserName(
    searchStr: string,
  ): Promise<UserInformationResponseDto[]> {
    return this.findUsersByFilter({ userName: searchStr });
  }

  public async findBasicByPhoneExcludingUser(
    phone: string,
    userId: number,
  ): Promise<TbBasicUser | null> {
    const user = await this.repo.findOne({ where: { phone } });
    if (!user || user.id === userId) {
      return null;
    }
    return user;
  }

  public async findBasicByEmailExcludingUser(
    email: string,
    userId: number,
  ): Promise<TbBasicUser | null> {
    const user = await this.repo.findOne({ where: { email } });
    if (!user || user.id === userId) {
      return null;
    }
    return user;
  }

  public async updateUserInformation(
    userId: number,
    payload: UpdateUserPayloadDto,
  ): Promise<UserInformationResponseDto | null> {
    return this.updateUser(userId, payload);
  }

  public async updateUserByAdmin(
    userId: number,
    payload: AdminUpdateUserPayloadDto,
  ): Promise<UserInformationResponseDto | null> {
    return this.updateUser(userId, payload);
  }

  private async updateUser(
    userId: number,
    payload: UpdateUserPayloadDto | AdminUpdateUserPayloadDto,
  ): Promise<UserInformationResponseDto | null> {
    const basic = await this.repo.findOne({ where: { id: userId } });
    if (!basic) {
      return null;
    }

    const info = await this.infoRepo.findOne({
      where: { userCode: basic.userCode },
    });
    if (!info) {
      return null;
    }

    const basicUpdate: Partial<TbBasicUser> = {};
    if (payload.userPhone !== undefined) {
      basicUpdate.phone = payload.userPhone;
    }
    if (payload.userEmail !== undefined) {
      basicUpdate.email = payload.userEmail;
    }

    const adminPayload = payload as AdminUpdateUserPayloadDto;
    if (adminPayload.userRole !== undefined) {
      basicUpdate.role = adminPayload.userRole;
    }
    if (adminPayload.userStatus !== undefined) {
      basicUpdate.status = adminPayload.userStatus;
    }
    if (adminPayload.userIsEmailVerified !== undefined) {
      basicUpdate.isEmailVerified = adminPayload.userIsEmailVerified;
    }

    const infoUpdate: Partial<TbInfoUser> = {};
    if (payload.userName !== undefined) {
      infoUpdate.userName = payload.userName;
    }
    if (payload.userDob !== undefined) {
      infoUpdate.userDob = payload.userDob;
    }
    if (payload.userGender !== undefined) {
      infoUpdate.userGender = payload.userGender;
    }
    if (payload.userAvatar !== undefined) {
      infoUpdate.avatar = payload.userAvatar;
    }

    if (Object.keys(basicUpdate).length > 0) {
      await this.repo.update({ id: userId }, basicUpdate);
    }
    if (Object.keys(infoUpdate).length > 0) {
      await this.infoRepo.update({ userCode: basic.userCode }, infoUpdate);
    }

    return this.findUserById(userId);
  }

  private async loadMergedUsers(
    basicUsers: TbBasicUser[],
  ): Promise<UserInformationResponseDto[]> {
    if (basicUsers.length === 0) {
      return [];
    }

    const infoUsers = await this.infoRepo.find({
      where: { userCode: In(basicUsers.map((basic) => basic.userCode)) },
    });

    return mergeUserInformationList(basicUsers, infoUsers);
  }

  private buildBasicWhere(
    filter: UserFilterPayloadDto,
  ): FindOptionsWhere<TbBasicUser> {
    const where: FindOptionsWhere<TbBasicUser> = {};

    if (filter.userId !== undefined) {
      where.id = filter.userId;
    }
    if (filter.userCode) {
      where.userCode = filter.userCode;
    }
    if (filter.userPhone) {
      where.phone = Like(`%${filter.userPhone}%`);
    }
    if (filter.userEmail) {
      where.email = Like(`%${filter.userEmail}%`);
    }
    if (filter.userRole !== undefined) {
      where.role = filter.userRole;
    }
    if (filter.userStatus !== undefined) {
      where.status = filter.userStatus;
    }

    return where;
  }

  private buildInfoWhere(
    filter: UserFilterPayloadDto,
  ): FindOptionsWhere<TbInfoUser> {
    const where: FindOptionsWhere<TbInfoUser> = {};

    if (filter.userCode) {
      where.userCode = filter.userCode;
    }
    if (filter.userName) {
      where.userName = Like(`%${filter.userName}%`);
    }
    if (filter.userGender !== undefined) {
      where.userGender = filter.userGender;
    }

    return where;
  }
}
