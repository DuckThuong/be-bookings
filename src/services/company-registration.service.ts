import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CompanyRegistrationRepository } from '../repositories/company-registration.repository';
import { CompanyRepository } from '../repositories/company.repository';
import { UserRepository } from '../repositories/user.repository';
import { RegistrationStatus } from '../entities/company-registration.entity';
import { UserRole, UserStatus } from '../dtos/user/common.dto';
import { TbCompany } from '../entities/company/company.entity';
import {
  EntityStatus,
  CODE_PREFIX,
} from '../assets/constants/company.constants';
import { randomUUID } from 'crypto';
import { CompanyRegistrationResponseDto } from '../dtos/company-registration.dto';
import { TbCompanyRegistration } from '../entities/company-registration.entity';

@Injectable()
export class CompanyRegistrationService {
  constructor(
    private readonly companyRegistrationRepository: CompanyRegistrationRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async createRegistration(
    userId: number,
    userCode: string,
    userName: string,
    userPhone: string,
    userEmail: string,
    payload: {
      companyName: string;
      address?: string;
      representativePhone?: string;
      representativeName?: string;
      representativePosition?: string;
      taxCode?: string;
      businessAddress?: string;
      businessLicenseDate?: string;
      businessLicenseUrl?: string;
      idCardUrl?: string;
      description?: string;
    },
  ): Promise<CompanyRegistrationResponseDto> {
    const existingPending =
      await this.companyRegistrationRepository.findPendingByUserId(userId);
    if (existingPending) {
      throw new HttpException(
        'Bạn đã có yêu cầu đăng ký nhà xe đang chờ xử lý',
        HttpStatus.BAD_REQUEST,
      );
    }

    const companyNameExists = await this.companyRepository.findCompanyByCode(
      payload.companyName,
    );
    if (companyNameExists) {
      throw new HttpException(
        'Tên nhà xe đã tồn tại trong hệ thống',
        HttpStatus.BAD_REQUEST,
      );
    }

    const registration = await this.companyRegistrationRepository.create({
      userId,
      userCode,
      userName,
      userPhone,
      userEmail,
      ...payload,
      status: RegistrationStatus.PENDING,
    });

    return this.mapToResponseDto(registration);
  }

  async findMyRegistration(
    userId: number,
  ): Promise<CompanyRegistrationResponseDto | null> {
    const registrations = await this.companyRegistrationRepository.findAll({
      userId,
    });
    const registration = registrations[0] ?? null;
    if (!registration) {
      return null;
    }
    return this.mapToResponseDto(registration);
  }

  async findById(id: number): Promise<CompanyRegistrationResponseDto> {
    const registration = await this.companyRegistrationRepository.findById(id);
    if (!registration) {
      throw new NotFoundException('Không tìm thấy yêu cầu đăng ký');
    }
    return this.mapToResponseDto(registration);
  }

  async findAll(status?: string): Promise<CompanyRegistrationResponseDto[]> {
    const registrations = await this.companyRegistrationRepository.findAll({
      status: status || undefined,
    });
    return registrations.map((registration) =>
      this.mapToResponseDto(registration),
    );
  }

  async approveRegistration(adminId: number, id: number) {
    const registration = await this.findById(id);

    if (registration.status !== RegistrationStatus.PENDING) {
      throw new BadRequestException('Yêu cầu này đã được xử lý');
    }
    const existingCompany =
      await this.companyRepository.findCompaniesByUserLead(
        registration.userId.toString(),
      );
    const activeCompany = existingCompany.find(
      (c) => c.status === EntityStatus.ACTIVE,
    );
    if (activeCompany) {
      throw new BadRequestException('Người dùng đã có nhà xe đang hoạt động');
    }

    const companyCode = this.generateCompanyCode();
    const company = await this.companyRepository.saveCompany({
      userLeadId: registration.userId,
      companyName: registration.companyName,
      code: companyCode,
      description: registration.description ?? '',
      status: EntityStatus.ACTIVE,
    });

    await this.userRepository.updateUserByAdmin(registration.userId, {
      userRole: UserRole.OWNER,
      userStatus: UserStatus.ACTIVE,
    });

    await this.companyRegistrationRepository.updateStatus(id, {
      status: RegistrationStatus.APPROVED,
      processedByAdminId: adminId,
      processedAt: new Date(),
      rejectionReason: undefined,
    });

    const updatedRegistration = await this.findById(id);

    return { company, registration: updatedRegistration };
  }

  async rejectRegistration(
    adminId: number,
    id: number,
    rejectionReason: string,
  ) {
    const registration = await this.findById(id);

    if (registration.status !== RegistrationStatus.PENDING) {
      throw new BadRequestException('Yêu cầu này đã được xử lý');
    }

    await this.companyRegistrationRepository.updateStatus(id, {
      status: RegistrationStatus.REJECTED,
      processedByAdminId: adminId,
      processedAt: new Date(),
      rejectionReason,
    });

    return this.findById(id);
  }

  private generateCompanyCode(): string {
    const suffix = randomUUID().split('-')[0].toUpperCase();
    return `${CODE_PREFIX.COMPANY}-${suffix}`;
  }

  private mapToResponseDto(
    registration: TbCompanyRegistration,
  ): CompanyRegistrationResponseDto {
    return {
      ...registration,
      createdAt: registration.createdAt.toISOString(),
      updatedAt: registration.updatedAt.toISOString(),
      processedAt: registration.processedAt?.toISOString() ?? undefined,
    } as CompanyRegistrationResponseDto;
  }
}
