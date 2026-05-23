import { MigrationInterface, QueryRunner } from 'typeorm';

export class TripFeFields1748100000000 implements MigrationInterface {
  name = 'TripFeFields1748100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`tb_trip\`
        ADD COLUMN \`departure\` varchar(50) NOT NULL DEFAULT '' COMMENT 'Giờ / thời điểm khởi hành',
        ADD COLUMN \`arrival\` varchar(50) NOT NULL DEFAULT '' COMMENT 'Giờ / thời điểm đến'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`tb_trip\`
        DROP COLUMN \`departure\`,
        DROP COLUMN \`arrival\`
    `);
  }
}
