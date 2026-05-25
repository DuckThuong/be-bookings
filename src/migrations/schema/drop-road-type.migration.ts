import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class DropRoadType1748170000000 implements MigrationInterface {
  name = 'DropRoadType1748170000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTypeColumn = await queryRunner.hasColumn('tb_road', 'type');
    if (hasTypeColumn) {
      await queryRunner.dropColumn('tb_road', 'type');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTypeColumn = await queryRunner.hasColumn('tb_road', 'type');
    if (!hasTypeColumn) {
      await queryRunner.addColumn(
        'tb_road',
        new TableColumn({
          name: 'type',
          type: 'varchar',
          length: '50',
          isNullable: false,
          comment: 'Loai tuyen duong',
        }),
      );
    }
  }
}
