import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientCatalogRepository } from '../../repositories/client-catalog.repository';
import { CompanyTripRepository } from '../../repositories/company-trip.repository';
import { SeatRepository } from '../../repositories/seat.repository';
import { ClientEnrichmentService } from '../client-enrichment.service';
import { ClientErrorMessage } from '../../assets/messages/client.message';
import { EntityStatus } from '../../assets/constants/company.constants';

@Injectable()
export class ClientSeatFlowService {
  constructor(
    private readonly catalogRepository: ClientCatalogRepository,
    private readonly companyTripRepository: CompanyTripRepository,
    private readonly seatRepository: SeatRepository,
    private readonly enrichment: ClientEnrichmentService,
  ) {}

  async getAvailability(companyTripId: number) {
    const companyTrip = await this.companyTripRepository.findById(companyTripId);
    if (!companyTrip || companyTrip.status !== EntityStatus.ACTIVE) {
      throw new NotFoundException(ClientErrorMessage.COMPANY_TRIP_NOT_FOUND);
    }

    const occupiedSeatIds =
      await this.catalogRepository.getOccupiedSeatIds(companyTripId);
    const seats = await this.seatRepository.findByVehicle(companyTrip.verhicalId);

    const seatDetails = seats.map((seat) => ({
      ...seat,
      isOccupied: occupiedSeatIds.includes(seat.id),
      isAvailable:
        seat.status === EntityStatus.ACTIVE &&
        !occupiedSeatIds.includes(seat.id),
    }));

    const schedule = await this.enrichment.enrichCompanyTripDetail(companyTrip);

    return {
      companyTripId,
      totalSeat: companyTrip.totalSeat,
      totalSeatBooked: companyTrip.totalSeatBooked,
      availableSeats: companyTrip.totalSeat - companyTrip.totalSeatBooked,
      occupiedSeatIds,
      seats: seatDetails,
      schedule,
    };
  }
}
