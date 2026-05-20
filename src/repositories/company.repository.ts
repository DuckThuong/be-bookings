import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TbCompany } from '../entities/company/company.entity';
import { TbRoad } from '../entities/road.entity';
import { TbTrip } from '../entities/trip.entity';
import { TbVerhical } from '../entities/verhical.entity';
import { TbDriver } from '../entities/driver.entity';
import { TbCompanyTrip } from '../entities/company/company-trip.entity';
import { TbSeat } from '../entities/seat.entity';
import { EntityStatus } from '../assets/constants/company.constants';

@Injectable()
export class CompanyRepository {
  constructor(
    @InjectRepository(TbCompany)
    private readonly companyRepo: Repository<TbCompany>,
    @InjectRepository(TbRoad)
    private readonly roadRepo: Repository<TbRoad>,
    @InjectRepository(TbTrip)
    private readonly tripRepo: Repository<TbTrip>,
    @InjectRepository(TbVerhical)
    private readonly vehicleRepo: Repository<TbVerhical>,
    @InjectRepository(TbDriver)
    private readonly driverRepo: Repository<TbDriver>,
    @InjectRepository(TbCompanyTrip)
    private readonly companyTripRepo: Repository<TbCompanyTrip>,
    @InjectRepository(TbSeat)
    private readonly seatRepo: Repository<TbSeat>,
  ) {}

  // --- Company ---
  findCompanyById(id: number) {
    return this.companyRepo.findOne({ where: { id } });
  }

  findCompanyByCode(code: string) {
    return this.companyRepo.findOne({ where: { code } });
  }

  findCompaniesByUserLead(userLeadId: string) {
    return this.companyRepo.find({ where: { userLeadId } });
  }

  findAllCompanies() {
    return this.companyRepo.find({ order: { id: 'DESC' } });
  }

  saveCompany(data: Partial<TbCompany>) {
    return this.companyRepo.save(this.companyRepo.create(data));
  }

  updateCompany(id: number, data: Partial<TbCompany>) {
    return this.companyRepo.update({ id }, data);
  }

  // --- Road ---
  findRoadById(id: number) {
    return this.roadRepo.findOne({ where: { id } });
  }

  findRoadsByCompany(companyId: number) {
    return this.roadRepo.find({
      where: { companyId },
      order: { id: 'DESC' },
    });
  }

  saveRoad(data: Partial<TbRoad>) {
    return this.roadRepo.save(this.roadRepo.create(data));
  }

  updateRoad(id: number, data: Partial<TbRoad>) {
    return this.roadRepo.update({ id }, data);
  }

  countRoadsByCompany(companyId: number) {
    return this.roadRepo.count({
      where: { companyId, status: EntityStatus.ACTIVE },
    });
  }

  // --- Trip ---
  findTripById(id: number) {
    return this.tripRepo.findOne({ where: { id } });
  }

  async findTripsByCompany(companyId: number) {
    const roads = await this.roadRepo.find({
      where: { companyId },
      select: ['id'],
    });
    if (roads.length === 0) {
      return [];
    }
    const roadIds = roads.map((r) => r.id);
    return this.tripRepo
      .createQueryBuilder('trip')
      .where('trip.roadId IN (:...roadIds)', { roadIds })
      .orderBy('trip.id', 'DESC')
      .getMany();
  }

  saveTrip(data: Partial<TbTrip>) {
    return this.tripRepo.save(this.tripRepo.create(data));
  }

  updateTrip(id: number, data: Partial<TbTrip>) {
    return this.tripRepo.update({ id }, data);
  }

  async countTripsByCompany(companyId: number) {
    const roads = await this.roadRepo.find({
      where: { companyId },
      select: ['id'],
    });
    if (roads.length === 0) {
      return 0;
    }
    return this.tripRepo
      .createQueryBuilder('trip')
      .where('trip.roadId IN (:...roadIds)', {
        roadIds: roads.map((r) => r.id),
      })
      .andWhere('trip.status = :status', { status: EntityStatus.ACTIVE })
      .getCount();
  }

  // --- Vehicle ---
  findVehicleById(id: number) {
    return this.vehicleRepo.findOne({ where: { id } });
  }

  findVehiclesByCompany(companyId: number) {
    return this.vehicleRepo.find({
      where: { companyId },
      order: { id: 'DESC' },
    });
  }

  findVehicleByCode(code: string) {
    return this.vehicleRepo.findOne({ where: { code } });
  }

  saveVehicle(data: Partial<TbVerhical>) {
    return this.vehicleRepo.save(this.vehicleRepo.create(data));
  }

  updateVehicle(id: number, data: Partial<TbVerhical>) {
    return this.vehicleRepo.update({ id }, data);
  }

  countVehiclesByCompany(companyId: number) {
    return this.vehicleRepo.count({
      where: { companyId, status: EntityStatus.ACTIVE },
    });
  }

  // --- Driver ---
  findDriverById(id: number) {
    return this.driverRepo.findOne({ where: { id } });
  }

  findDriversByCompany(companyId: number) {
    return this.driverRepo.find({
      where: { companyId },
      order: { id: 'DESC' },
    });
  }

  saveDriver(data: Partial<TbDriver>) {
    return this.driverRepo.save(this.driverRepo.create(data));
  }

  updateDriver(id: number, data: Partial<TbDriver>) {
    return this.driverRepo.update({ id }, data);
  }

  countDriversByCompany(companyId: number) {
    return this.driverRepo.count({
      where: { companyId, status: EntityStatus.ACTIVE },
    });
  }

  // --- Company trip ---
  findCompanyTripById(id: number) {
    return this.companyTripRepo.findOne({ where: { id } });
  }

  findCompanyTripsByCompany(companyId: number) {
    return this.companyTripRepo.find({
      where: { companyId },
      order: { id: 'DESC' },
    });
  }

  saveCompanyTrip(data: Partial<TbCompanyTrip>) {
    return this.companyTripRepo.save(this.companyTripRepo.create(data));
  }

  updateCompanyTrip(id: number, data: Partial<TbCompanyTrip>) {
    return this.companyTripRepo.update({ id }, data);
  }

  countCompanyTripsByCompany(companyId: number) {
    return this.companyTripRepo.count({
      where: { companyId, status: EntityStatus.ACTIVE },
    });
  }

  // --- Seat ---
  findSeatById(id: number) {
    return this.seatRepo.findOne({ where: { id } });
  }

  findSeatsByVehicle(verhicalId: number) {
    return this.seatRepo.find({
      where: { verhicalId },
      order: { id: 'ASC' },
    });
  }

  saveSeat(data: Partial<TbSeat>) {
    return this.seatRepo.save(this.seatRepo.create(data));
  }

  saveSeats(data: Partial<TbSeat>[]) {
    const entities = data.map((item) => this.seatRepo.create(item));
    return this.seatRepo.save(entities);
  }

  async countSeatsByCompany(companyId: number) {
    const vehicles = await this.vehicleRepo.find({
      where: { companyId },
      select: ['id'],
    });
    if (vehicles.length === 0) {
      return 0;
    }
    return this.seatRepo
      .createQueryBuilder('seat')
      .where('seat.verhicalId IN (:...ids)', {
        ids: vehicles.map((v) => v.id),
      })
      .getCount();
  }
}
