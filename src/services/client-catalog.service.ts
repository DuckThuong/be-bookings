import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientCatalogRepository } from '../repositories/client-catalog.repository';
import { ClientEnrichmentService } from './client-enrichment.service';
import { ClientErrorMessage } from '../assets/messages/client.message';
import {
  ClientCompanyQueryDto,
  ClientCompanyTripQueryDto,
  ClientRoadQueryDto,
  ClientTripQueryDto,
} from '../dtos/CLIENT/client.dto';
import { parsePageLimit } from '../common/helpers/pagination.helper';

@Injectable()
export class ClientCatalogService {
  constructor(
    private readonly catalogRepository: ClientCatalogRepository,
    private readonly enrichment: ClientEnrichmentService,
  ) {}

  async listCompanies(query: ClientCompanyQueryDto) {
    const { page, limit } = parsePageLimit(query.page, query.limit);
    const { items, total } = await this.catalogRepository.findCompanies({
      search: query.search,
      status: query.status,
      page,
      limit,
    });
    const enriched = await this.enrichment.enrichCompanies(items);
    return this.enrichment.wrapPaginated(enriched, total, page, limit);
  }

  async getCompany(id: number) {
    const company = await this.catalogRepository.findCompanyById(id);
    if (!company) {
      throw new NotFoundException(ClientErrorMessage.COMPANY_NOT_FOUND);
    }
    return this.enrichment.enrichCompanyDetail(company);
  }

  async listRoads(query: ClientRoadQueryDto) {
    const { page, limit } = parsePageLimit(query.page, query.limit);
    const { items, total } = await this.catalogRepository.findRoads({
      companyId: query.companyId,
      search: query.search,
      startPoint: query.startPoint,
      endPoint: query.endPoint,
      status: query.status,
      page,
      limit,
    });
    const enriched = await this.enrichment.enrichRoads(items);
    return this.enrichment.wrapPaginated(enriched, total, page, limit);
  }

  async getRoad(id: number) {
    const road = await this.catalogRepository.findRoadById(id);
    if (!road) {
      throw new NotFoundException(ClientErrorMessage.ROAD_NOT_FOUND);
    }
    return this.enrichment.enrichRoadDetail(road);
  }

  async listTrips(query: ClientTripQueryDto) {
    const { page, limit } = parsePageLimit(query.page, query.limit);
    const { items, total } = await this.catalogRepository.findTrips({
      companyId: query.companyId,
      roadId: query.roadId,
      search: query.search,
      status: query.status,
      page,
      limit,
    });
    const enriched = await this.enrichment.enrichTrips(items);
    return this.enrichment.wrapPaginated(enriched, total, page, limit);
  }

  async getTrip(id: number) {
    const trip = await this.catalogRepository.findTripById(id);
    if (!trip) {
      throw new NotFoundException(ClientErrorMessage.TRIP_NOT_FOUND);
    }
    return this.enrichment.enrichTripDetail(trip);
  }

  async listCompanyTrips(query: ClientCompanyTripQueryDto) {
    const { page, limit } = parsePageLimit(query.page, query.limit);
    const { items, total } = await this.catalogRepository.findCompanyTrips({
      companyId: query.companyId,
      tripId: query.tripId,
      roadId: query.roadId,
      status: query.status,
      minAvailableSeats: query.minAvailableSeats,
      page,
      limit,
    });
    const enriched = await this.enrichment.enrichCompanyTrips(items);
    return this.enrichment.wrapPaginated(enriched, total, page, limit);
  }

  async getCompanyTrip(id: number) {
    const companyTrip = await this.catalogRepository.findCompanyTripById(id);
    if (!companyTrip) {
      throw new NotFoundException(ClientErrorMessage.COMPANY_TRIP_NOT_FOUND);
    }
    return this.enrichment.enrichCompanyTripDetail(companyTrip);
  }
}
