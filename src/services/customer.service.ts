import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CustomerRepository } from '../repositories/customer.repository';
import { UserRepository } from '../repositories/user.repository';
import { CompanyAccessService } from './company-access.service';
import { CustomerErrorMessage } from '../assets/messages/customer.message';
import {
  CustomerDetailDto,
  CustomerFilterQueryDto,
  CustomerListItemDto,
} from '../dtos/customer/customer.dto';
import {
  UserDecoratorDtoResponse,
  UserRole,
} from '../dtos/user/common.dto';
import { UserInformationResponseDto } from '../dtos/user/user.dto';

const RANKS = [
  { name: 'Bronze', threshold: 0 },
  { name: 'Silver', threshold: 1_000_000 },
  { name: 'Gold', threshold: 5_000_000 },
  { name: 'Platinum', threshold: 15_000_000 },
] as const;

@Injectable()
export class CustomerService {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly userRepository: UserRepository,
    private readonly companyAccess: CompanyAccessService,
  ) {}

  async getMe(user: UserDecoratorDtoResponse): Promise<CustomerDetailDto> {
    const profile = await this.userRepository.findUserByUserCode(user.userCode);
    if (!profile) {
      throw new NotFoundException(CustomerErrorMessage.CUSTOMER_NOT_FOUND);
    }
    this.assertIsCustomer(profile);
    const activity = await this.customerRepository.getGlobalActivity(
      user.userCode,
    );
    return this.toDetail(profile, activity);
  }

  async findAll(
    user: UserDecoratorDtoResponse,
    query: CustomerFilterQueryDto,
  ): Promise<CustomerListItemDto[]> {
    let customerIds: string[] = [];
    let companyId: number | undefined = query.companyId;

    if (user.role === UserRole.OWNER) {
      if (!companyId) {
        throw new HttpException(
          CustomerErrorMessage.COMPANY_ID_REQUIRED,
          HttpStatus.BAD_REQUEST,
        );
      }
      await this.companyAccess.assertCompanyAccess(user, companyId);
      customerIds =
        await this.customerRepository.findDistinctCustomerIdsByCompany(
          companyId,
        );
    } else if (user.role === UserRole.ADMIN) {
      if (companyId) {
        customerIds =
          await this.customerRepository.findDistinctCustomerIdsByCompany(
            companyId,
          );
      } else {
        const allCustomers = await this.userRepository.findAllCustomers();
        return this.mapListWithGlobalStats(allCustomers, query.search);
      }
    } else {
      throw new ForbiddenException(CustomerErrorMessage.FORBIDDEN);
    }

    const profiles =
      await this.userRepository.findUsersByUserCodes(customerIds);
    const list = await Promise.all(
      profiles.map(async (profile) => {
        const activity = await this.customerRepository.getActivityByCompany(
          companyId!,
          profile.userCode,
        );
        return this.toListItem(profile, activity);
      }),
    );

    return this.filterBySearch(list, query.search);
  }

  async findOne(
    user: UserDecoratorDtoResponse,
    userCode: string,
    companyId?: number,
  ): Promise<CustomerDetailDto> {
    const profile = await this.userRepository.findUserByUserCode(userCode);
    if (!profile) {
      throw new NotFoundException(CustomerErrorMessage.CUSTOMER_NOT_FOUND);
    }
    this.assertIsCustomer(profile);
    await this.assertCanViewCustomer(user, userCode, companyId);

    const activity =
      companyId !== undefined
        ? await this.customerRepository.getActivityByCompany(
            companyId,
            userCode,
          )
        : await this.customerRepository.getGlobalActivity(userCode);

    return this.toDetail(profile, activity);
  }

  async getTickets(
    user: UserDecoratorDtoResponse,
    userCode: string,
    companyId?: number,
  ) {
    await this.assertCanViewCustomer(user, userCode, companyId);
    return this.customerRepository.findTickets(companyId, userCode);
  }

  async getBookings(
    user: UserDecoratorDtoResponse,
    userCode: string,
    companyId?: number,
  ) {
    await this.assertCanViewCustomer(user, userCode, companyId);
    return this.customerRepository.findBookings(companyId, userCode);
  }

  async getPayments(
    user: UserDecoratorDtoResponse,
    userCode: string,
    companyId?: number,
  ) {
    await this.assertCanViewCustomer(user, userCode, companyId);
    return this.customerRepository.findPayments(companyId, userCode);
  }

  private async mapListWithGlobalStats(
    profiles: UserInformationResponseDto[],
    search?: string,
  ): Promise<CustomerListItemDto[]> {
    const list = await Promise.all(
      profiles.map(async (profile) => {
        const activity = await this.customerRepository.getGlobalActivity(
          profile.userCode,
        );
        return this.toListItem(profile, activity);
      }),
    );
    return this.filterBySearch(list, search);
  }

  private toListItem(
    profile: UserInformationResponseDto,
    activity: {
      ticketCount: number;
      bookingCount: number;
      totalPaid: number;
      lastActivityAt: Date | null;
    },
  ): CustomerListItemDto {
    const rankInfo = this.getRankInfo(activity.totalPaid);
    return {
      ...profile,
      ticketCount: activity.ticketCount,
      bookingCount: activity.bookingCount,
      totalPaid: activity.totalPaid,
      rank: rankInfo.rank,
      spentAmount: activity.totalPaid,
      nextRank: rankInfo.nextRank,
      nextRankThreshold: rankInfo.nextRankThreshold,
      rankProgressPercent: rankInfo.rankProgressPercent,
      lastBookingAt: activity.lastActivityAt
        ? activity.lastActivityAt.toISOString()
        : undefined,
    };
  }

  private toDetail(
    profile: UserInformationResponseDto,
    activity: {
      ticketCount: number;
      bookingCount: number;
      totalPaid: number;
      lastActivityAt: Date | null;
      pendingTicketCount: number;
      refundCount: number;
    },
  ): CustomerDetailDto {
    return {
      ...this.toListItem(profile, activity),
      pendingTicketCount: activity.pendingTicketCount,
      refundCount: activity.refundCount,
    };
  }

  private filterBySearch<T extends CustomerListItemDto>(
    list: T[],
    search?: string,
  ): T[] {
    if (!search?.trim()) {
      return list;
    }
    const q = search.trim().toLowerCase();
    return list.filter(
      (c) =>
        c.userName?.toLowerCase().includes(q) ||
        c.userPhone?.toLowerCase().includes(q) ||
        c.userEmail?.toLowerCase().includes(q) ||
        c.userCode?.toLowerCase().includes(q),
    );
  }

  private assertIsCustomer(profile: UserInformationResponseDto) {
    if (profile.userRole !== UserRole.USER) {
      throw new HttpException(
        CustomerErrorMessage.NOT_A_CUSTOMER,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async assertCanViewCustomer(
    user: UserDecoratorDtoResponse,
    userCode: string,
    companyId?: number,
  ) {
    if (user.role === UserRole.USER) {
      if (user.userCode !== userCode) {
        throw new ForbiddenException(CustomerErrorMessage.FORBIDDEN);
      }
      return;
    }

    if (user.role === UserRole.OWNER) {
      if (!companyId) {
        throw new HttpException(
          CustomerErrorMessage.COMPANY_ID_REQUIRED,
          HttpStatus.BAD_REQUEST,
        );
      }
      await this.companyAccess.assertCompanyAccess(user, companyId);
      const ids =
        await this.customerRepository.findDistinctCustomerIdsByCompany(
          companyId,
        );
      if (!ids.includes(userCode)) {
        throw new NotFoundException(CustomerErrorMessage.CUSTOMER_NOT_FOUND);
      }
      return;
    }

    if (user.role === UserRole.ADMIN) {
      if (companyId) {
        await this.companyAccess.assertCompanyAccess(user, companyId);
      }
      return;
    }

    throw new ForbiddenException(CustomerErrorMessage.FORBIDDEN);
  }

  private getRankInfo(totalSpent: number) {
    const currentIndex = [...RANKS]
      .reverse()
      .findIndex((rank) => totalSpent >= rank.threshold);
    const rank =
      currentIndex === -1
        ? RANKS[0]
        : RANKS[RANKS.length - 1 - currentIndex];

    const nextRank = RANKS.find((item) => item.threshold > rank.threshold);
    const nextRankThreshold = nextRank?.threshold;
    const rankProgressPercent = nextRankThreshold
      ? Math.min(
          100,
          Math.round(
            ((totalSpent - rank.threshold) /
              (nextRankThreshold - rank.threshold)) *
              100,
          ),
        )
      : 100;

    return {
      rank: rank.name,
      nextRank: nextRank?.name,
      nextRankThreshold,
      rankProgressPercent,
    };
  }
}
