import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  MASTER_DATA_TYPE_SERVICE,
  SERVICES,
  ServiceSeed,
} from './service.data';

export class Service1747741200000 implements MigrationInterface {
  name = 'Service1747741200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const [index, service] of SERVICES.entries()) {
      await queryRunner.query(
        `INSERT INTO \`tb_master_data\` (\`type\`, \`code\`, \`name\`, \`rule\`, \`sort\`)
         VALUES (?, ?, ?, ?, ?)`,
        [
          MASTER_DATA_TYPE_SERVICE,
          service.id,
          service.label,
          this.buildServiceRule(service),
          index + 1,
        ],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const codes = SERVICES.map((service) => service.id);
    const placeholders = codes.map(() => '?').join(', ');

    await queryRunner.query(
      `DELETE FROM \`tb_master_data\`
       WHERE \`type\` = ? AND \`code\` IN (${placeholders})`,
      [MASTER_DATA_TYPE_SERVICE, ...codes],
    );
  }

  private buildServiceRule(service: ServiceSeed): string {
    return JSON.stringify({
      id: service.id,
      icon: service.icon,
      label: service.label,
      desc: service.desc,
      tag: service.tag,
      tagColor: service.tagColor,
    });
  }
}
