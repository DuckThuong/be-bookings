import { MigrationInterface, QueryRunner } from 'typeorm';

export class BookingFeFields1748200000000 implements MigrationInterface {
  name = 'BookingFeFields1748200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`tb_booking\`
        ADD COLUMN \`passenger\` json NULL COMMENT 'Thông tin hành khách',
        ADD COLUMN \`addons\` json NULL COMMENT 'Dịch vụ thêm',
        ADD COLUMN \`service_fee\` decimal(12,2) NOT NULL DEFAULT 0 COMMENT 'Phí dịch vụ',
        ADD COLUMN \`addons_total\` decimal(12,2) NOT NULL DEFAULT 0 COMMENT 'Tổng tiền addon',
        ADD COLUMN \`vehicle_type\` varchar(10) NULL COMMENT 'Loại xe FE: 16|36|45',
        ADD COLUMN \`floor\` int NULL COMMENT 'Tầng xe',
        ADD COLUMN \`payment_method_id\` varchar(20) NULL COMMENT 'Phương thức thanh toán FE'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`tb_booking\`
        DROP COLUMN \`passenger\`,
        DROP COLUMN \`addons\`,
        DROP COLUMN \`service_fee\`,
        DROP COLUMN \`addons_total\`,
        DROP COLUMN \`vehicle_type\`,
        DROP COLUMN \`floor\`,
        DROP COLUMN \`payment_method_id\`
    `);
  }
}
