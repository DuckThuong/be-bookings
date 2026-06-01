import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVehicleLayoutConfig1762090000000
  implements MigrationInterface
{
  name = 'AddVehicleLayoutConfig1762090000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `tb_vehicle` ADD `layout_config` json NULL COMMENT \'Cấu hình ma trận ghế/lối đi\'',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `tb_vehicle` DROP COLUMN `layout_config`',
    );
  }
}
