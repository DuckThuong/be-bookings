import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  MASTER_DATA_TYPE_TOP_TRIP,
  TOP_TRIPS,
  TopTripSeed,
} from './top-trip.data';

export class TopTrip1747651200000 implements MigrationInterface {
  name = 'TopTrip1747651200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const [index, trip] of TOP_TRIPS.entries()) {
      await queryRunner.query(
        `INSERT INTO \`tb_master_data\` (\`type\`, \`code\`, \`name\`, \`rule\`, \`sort\`)
         VALUES (?, ?, ?, ?, ?)`,
        [
          MASTER_DATA_TYPE_TOP_TRIP,
          trip.id,
          `${trip.from} - ${trip.to}`,
          this.buildTripRule(trip),
          index + 1,
        ],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const codes = TOP_TRIPS.map((trip) => trip.id);
    const placeholders = codes.map(() => '?').join(', ');

    await queryRunner.query(
      `DELETE FROM \`tb_master_data\`
       WHERE \`type\` = ? AND \`code\` IN (${placeholders})`,
      [MASTER_DATA_TYPE_TOP_TRIP, ...codes],
    );
  }

  private buildTripRule(trip: TopTripSeed): string {
    return JSON.stringify({
      id: trip.id,
      from: trip.from,
      to: trip.to,
      operator: trip.operator,
      operatorLogo: trip.operatorLogo,
      departure: trip.departure,
      duration: trip.duration,
      seats: trip.seats,
      price: trip.price,
      type: trip.type,
      rating: trip.rating,
    });
  }
}
