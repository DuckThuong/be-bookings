import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export class TripOnlySource1762026000000 implements MigrationInterface {
  name = 'TripOnlySource1762026000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.addTripIdColumn(queryRunner, 'tb_payment');
    await this.addTripIdColumn(queryRunner, 'tb_refund');

    if (
      (await queryRunner.hasTable('tb_company_trip')) &&
      (await queryRunner.hasColumn('tb_payment', 'companyTripId'))
    ) {
      await queryRunner.query(`
        UPDATE tb_payment p
        INNER JOIN tb_company_trip ct ON ct.id = p.companyTripId
        SET p.tripId = ct.tripId
        WHERE p.tripId IS NULL
      `);
    }

    await queryRunner.query(`
      UPDATE tb_payment p
      INNER JOIN tb_ticket t ON t.id = p.ticketId
      SET p.tripId = t.tripId
      WHERE p.tripId IS NULL
    `);

    await queryRunner.query(`
      UPDATE tb_refund r
      INNER JOIN tb_ticket t ON t.id = r.ticketId
      SET r.tripId = t.tripId
      WHERE r.tripId IS NULL
    `);

    await queryRunner.query(`
      UPDATE tb_refund r
      INNER JOIN tb_payment p ON p.id = r.paymentId
      SET r.tripId = p.tripId
      WHERE r.tripId IS NULL
    `);

    if (
      (await queryRunner.hasTable('tb_company_trip')) &&
      (await queryRunner.hasColumn('tb_refund', 'companyTripId'))
    ) {
      await queryRunner.query(`
        UPDATE tb_refund r
        INNER JOIN tb_company_trip ct ON ct.id = r.companyTripId
        SET r.tripId = ct.tripId
        WHERE r.tripId IS NULL
      `);
    }

    await this.rebuildTripStats(queryRunner);
    await this.rebuildTripBookedSeats(queryRunner);

    await this.dropColumnIfExists(queryRunner, 'tb_booking', 'companyTripId');
    await this.dropColumnIfExists(queryRunner, 'tb_ticket', 'companyTripId');
    await this.dropColumnIfExists(queryRunner, 'tb_payment', 'companyTripId');
    await this.dropColumnIfExists(queryRunner, 'tb_refund', 'companyTripId');

    await this.setTripIdRequired(queryRunner, 'tb_payment');
    await this.setTripIdRequired(queryRunner, 'tb_refund');

    if (await queryRunner.hasTable('tb_company_trip')) {
      await queryRunner.dropTable('tb_company_trip');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('tb_company_trip'))) {
      await queryRunner.createTable(
        new Table({
          name: 'tb_company_trip',
          columns: [
            {
              name: 'id',
              type: 'int',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            { name: 'companyId', type: 'int' },
            { name: 'tripId', type: 'int' },
            { name: 'vehicleId', type: 'int' },
            { name: 'driverId', type: 'int' },
            { name: 'description', type: 'text' },
            { name: 'totalSeat', type: 'int' },
            { name: 'totalSeatBooked', type: 'int' },
            { name: 'totalPrice', type: 'decimal', precision: 12, scale: 2 },
            { name: 'pricePerSeat', type: 'decimal', precision: 12, scale: 2 },
            { name: 'status', type: 'varchar', length: '255' },
            { name: 'created_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
            {
              name: 'updated_at',
              type: 'datetime',
              default: 'CURRENT_TIMESTAMP',
              onUpdate: 'CURRENT_TIMESTAMP',
            },
          ],
        }),
      );
    }

    await this.addLegacyCompanyTripIdColumn(queryRunner, 'tb_booking');
    await this.addLegacyCompanyTripIdColumn(queryRunner, 'tb_ticket');
    await this.addLegacyCompanyTripIdColumn(queryRunner, 'tb_payment');
    await this.addLegacyCompanyTripIdColumn(queryRunner, 'tb_refund');

    if (await queryRunner.hasTable('tb_trip_stat')) {
      await queryRunner.renameTable('tb_trip_stat', 'tb_company_trip_stat');
      if (!(await queryRunner.hasColumn('tb_company_trip_stat', 'companyTripId'))) {
        await queryRunner.addColumn(
          'tb_company_trip_stat',
          new TableColumn({
            name: 'companyTripId',
            type: 'int',
            isNullable: true,
          }),
        );
      }
      await this.dropColumnIfExists(queryRunner, 'tb_company_trip_stat', 'tripId');
    }

    await this.dropColumnIfExists(queryRunner, 'tb_payment', 'tripId');
    await this.dropColumnIfExists(queryRunner, 'tb_refund', 'tripId');
  }

  private async addTripIdColumn(
    queryRunner: QueryRunner,
    tableName: string,
  ): Promise<void> {
    if (!(await queryRunner.hasColumn(tableName, 'tripId'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'tripId',
          type: 'int',
          isNullable: true,
        }),
      );
    }
  }

  private async setTripIdRequired(
    queryRunner: QueryRunner,
    tableName: string,
  ): Promise<void> {
    if (await queryRunner.hasColumn(tableName, 'tripId')) {
      await queryRunner.query(`
        DELETE FROM ${tableName}
        WHERE tripId IS NULL
      `);
      await queryRunner.changeColumn(
        tableName,
        'tripId',
        new TableColumn({
          name: 'tripId',
          type: 'int',
          isNullable: false,
        }),
      );
    }
  }

  private async addLegacyCompanyTripIdColumn(
    queryRunner: QueryRunner,
    tableName: string,
  ): Promise<void> {
    if (!(await queryRunner.hasColumn(tableName, 'companyTripId'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'companyTripId',
          type: 'int',
          isNullable: true,
        }),
      );
    }
  }

  private async dropColumnIfExists(
    queryRunner: QueryRunner,
    tableName: string,
    columnName: string,
  ): Promise<void> {
    if (
      (await queryRunner.hasTable(tableName)) &&
      (await queryRunner.hasColumn(tableName, columnName))
    ) {
      await queryRunner.dropColumn(tableName, columnName);
    }
  }

  private async rebuildTripStats(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('tb_company_trip_stat')) {
      if (!(await queryRunner.hasColumn('tb_company_trip_stat', 'tripId'))) {
        await queryRunner.addColumn(
          'tb_company_trip_stat',
          new TableColumn({
            name: 'tripId',
            type: 'int',
            isNullable: true,
          }),
        );
      }

      if (
        (await queryRunner.hasTable('tb_company_trip')) &&
        (await queryRunner.hasColumn('tb_company_trip_stat', 'companyTripId'))
      ) {
        await queryRunner.query(`
          UPDATE tb_company_trip_stat s
          INNER JOIN tb_company_trip ct ON ct.id = s.companyTripId
          SET s.tripId = ct.tripId
          WHERE s.tripId IS NULL
        `);
      }

      await this.dropColumnIfExists(
        queryRunner,
        'tb_company_trip_stat',
        'companyTripId',
      );

      if (!(await queryRunner.hasTable('tb_trip_stat'))) {
        await queryRunner.renameTable('tb_company_trip_stat', 'tb_trip_stat');
      }
    }

    if (!(await queryRunner.hasTable('tb_trip_stat'))) {
      await queryRunner.createTable(
        new Table({
          name: 'tb_trip_stat',
          columns: [
            {
              name: 'id',
              type: 'int',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            { name: 'tripId', type: 'int' },
            { name: 'companyId', type: 'int' },
            { name: 'statDate', type: 'date' },
            { name: 'ticketCount', type: 'int', default: 0 },
            { name: 'seatSold', type: 'int', default: 0 },
            { name: 'grossRevenue', type: 'decimal', precision: 14, scale: 2, default: 0 },
            { name: 'discountTotal', type: 'decimal', precision: 14, scale: 2, default: 0 },
            { name: 'netRevenue', type: 'decimal', precision: 14, scale: 2, default: 0 },
            { name: 'refundTotal', type: 'decimal', precision: 14, scale: 2, default: 0 },
            { name: 'cancelledCount', type: 'int', default: 0 },
            { name: 'occupancyRate', type: 'decimal', precision: 5, scale: 2, default: 0 },
            { name: 'created_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
            {
              name: 'updated_at',
              type: 'datetime',
              default: 'CURRENT_TIMESTAMP',
              onUpdate: 'CURRENT_TIMESTAMP',
            },
          ],
        }),
      );
    }
  }

  private async rebuildTripBookedSeats(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE tb_trip t
      LEFT JOIN (
        SELECT tripId, COALESCE(SUM(totalSeat), 0) AS bookedSeats
        FROM tb_ticket
        WHERE status IN ('PENDING', 'PAID')
        GROUP BY tripId
      ) agg ON agg.tripId = t.id
      SET t.bookedSeats = GREATEST(t.bookedSeats, COALESCE(agg.bookedSeats, 0))
    `);
  }
}
