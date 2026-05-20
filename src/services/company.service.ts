import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TbCompany } from '../entities/company/company.entity';
import { CompanyRepository } from '../repositories/company.repository';
import { RoadRepository } from '../repositories/road.repository';
import { TripRepository } from '../repositories/trip.repository';
import { VehicleRepository } from '../repositories/vehicle.repository';
import { DriverRepository } from '../repositories/driver.repository';
import { CompanyTripRepository } from '../repositories/company-trip.repository';
import { SeatRepository } from '../repositories/seat.repository';
import {
  CODE_PREFIX,
  EntityStatus,
} from '../assets/constants/company.constants';
import { CompanyErrorMessage } from '../assets/messages/company.message';
import {
  generateEntityCode,
  validString,
} from '../common/helpers/common.helper';
import {
  CompanyOverviewDto,
  CreateCompanyDto,
  UpdateCompanyDto,
} from '../dtos/company/company.dto';
import { UserDecoratorDtoResponse, UserRole } from '../dtos/user/common.dto';
import { CompanyAccessService } from './company-access.service';

@Injectable()
export class CompanyService {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly roadRepository: RoadRepository,
    private readonly tripRepository: TripRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly driverRepository: DriverRepository,
    private readonly companyTripRepository: CompanyTripRepository,
    private readonly seatRepository: SeatRepository,
    private readonly companyAccess: CompanyAccessService,
  ) {}

  async createCompany(
    user: UserDecoratorDtoResponse,
    payload: CreateCompanyDto,
  ): Promise<TbCompany> {
    if (!validString(payload.companyName)) {
      throw new HttpException(
        CompanyErrorMessage.COMPANY_NAME_REQUIRED,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (user.role === UserRole.OWNER) {
      const existing = await this.companyRepository.findCompaniesByUserLead(
        user.userCode,
      );
      const active = existing.find((c) => c.status === EntityStatus.ACTIVE);
      if (active) {
        throw new HttpException(
          CompanyErrorMessage.COMPANY_ALREADY_EXISTS,
          HttpStatus.CONFLICT,
        );
      }
    }

    return this.companyRepository.saveCompany({
      companyName: payload.companyName.trim(),
      description: payload.description ?? undefined,
      userLeadId: user.userCode,
      code: generateEntityCode(CODE_PREFIX.COMPANY),
      status: payload.status ?? EntityStatus.ACTIVE,
    });
  }

  async getCompanies(user: UserDecoratorDtoResponse): Promise<TbCompany[]> {
    if (user.role === UserRole.ADMIN) {
      return this.companyRepository.findAllCompanies();
    }
    if (user.role === UserRole.OWNER) {
      return this.companyRepository.findCompaniesByUserLead(user.userCode);
    }
    throw new ForbiddenException(CompanyErrorMessage.FORBIDDEN);
  }

  async getMyCompany(user: UserDecoratorDtoResponse): Promise<TbCompany> {
    const companies = await this.companyRepository.findCompaniesByUserLead(
      user.userCode,
    );
    const active = companies.find((c) => c.status === EntityStatus.ACTIVE);
    if (!active) {
      throw new NotFoundException(CompanyErrorMessage.COMPANY_NOT_FOUND);
    }
    return active;
  }

  async getCompanyById(
    user: UserDecoratorDtoResponse,
    companyId: number,
  ): Promise<TbCompany> {
    return this.companyAccess.assertCompanyAccess(user, companyId);
  }

  async updateCompany(
    user: UserDecoratorDtoResponse,
    companyId: number,
    payload: UpdateCompanyDto,
  ): Promise<TbCompany> {
    await this.companyAccess.assertCompanyAccess(user, companyId);

    const update: Partial<TbCompany> = {};
    if (payload.companyName !== undefined) {
      update.companyName = payload.companyName.trim();
    }
    if (payload.description !== undefined) {
      update.description = payload.description;
    }
    if (payload.status !== undefined) {
      update.status = payload.status;
    }
    if (payload.userLeadId !== undefined && user.role === UserRole.ADMIN) {
      update.userLeadId = payload.userLeadId;
    }

    if (Object.keys(update).length > 0) {
      await this.companyRepository.updateCompany(companyId, update);
    }

    const updated = await this.companyRepository.findCompanyById(companyId);
    if (!updated) {
      throw new NotFoundException(CompanyErrorMessage.COMPANY_NOT_FOUND);
    }
    return updated;
  }

  async deleteCompany(
    user: UserDecoratorDtoResponse,
    companyId: number,
  ): Promise<{ message: string }> {
    await this.companyAccess.assertCompanyAccess(user, companyId);
    await this.companyRepository.updateCompany(companyId, {
      status: EntityStatus.INACTIVE,
    });
    return { message: 'Đã vô hiệu hóa nhà xe' };
  }

  async getCompanyOverview(
    user: UserDecoratorDtoResponse,
    companyId: number,
  ): Promise<CompanyOverviewDto> {
    await this.companyAccess.assertCompanyAccess(user, companyId);

    const roads = await this.roadRepository.findByCompany(companyId);
    const roadIds = roads.map((r) => r.id);
    const vehicles = await this.vehicleRepository.findIdsByCompany(companyId);

    const [roadCount, tripCount, vehicleCount, driverCount, companyTripCount, seatCount] =
      await Promise.all([
        this.roadRepository.countActiveByCompany(companyId),
        this.tripRepository.countActiveByRoadIds(roadIds),
        this.vehicleRepository.countActiveByCompany(companyId),
        this.driverRepository.countActiveByCompany(companyId),
        this.companyTripRepository.countActiveByCompany(companyId),
        this.seatRepository.countByVehicleIds(vehicles.map((v) => v.id)),
      ]);

    return {
      roadCount,
      tripCount,
      vehicleCount,
      driverCount,
      companyTripCount,
      seatCount,
    };
  }
}
