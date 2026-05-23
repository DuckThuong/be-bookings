import { MigrationInterface, QueryRunner } from 'typeorm';

export class RoadFeFields1748000000000 implements MigrationInterface {
  name = 'RoadFeFields1748000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`tb_road\`
        ADD COLUMN \`standardDuration\` varchar(50) NOT NULL DEFAULT '' COMMENT 'Thời gian di chuyển chuẩn',
        ADD COLUMN \`tripsPerDay\` int NOT NULL DEFAULT 0 COMMENT 'Số chuyến mỗi ngày',
        ADD COLUMN \`averageOccupancy\` decimal(5,2) NOT NULL DEFAULT 0 COMMENT 'Tỉ lệ lấp đầy trung bình (%)',
        ADD COLUMN \`estimatedRevenue\` decimal(15,2) NOT NULL DEFAULT 0 COMMENT 'Doanh thu ước tính',
        ADD COLUMN \`leadVehicle\` varchar(255) NULL COMMENT 'Xe chủ lực',
        ADD COLUMN \`demandLevel\` varchar(50) NULL COMMENT 'Mức nhu cầu',
        ADD COLUMN \`note\` varchar(500) NULL COMMENT 'Ghi chú'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`tb_road\`
        DROP COLUMN \`standardDuration\`,
        DROP COLUMN \`tripsPerDay\`,
        DROP COLUMN \`averageOccupancy\`,
        DROP COLUMN \`estimatedRevenue\`,
        DROP COLUMN \`leadVehicle\`,
        DROP COLUMN \`demandLevel\`,
        DROP COLUMN \`note\`
    `);
  }
}
