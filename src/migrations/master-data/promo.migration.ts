import { MigrationInterface, QueryRunner } from 'typeorm';
import { MASTER_DATA_TYPE_PROMO, PROMOS, PromoSeed } from './promo.data';

export class Promo1747741200001 implements MigrationInterface {
  name = 'Promo1747741200001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const [index, promo] of PROMOS.entries()) {
      await queryRunner.query(
        `INSERT INTO \`tb_master_data\` (\`type\`, \`code\`, \`name\`, \`rule\`, \`sort\`)
         VALUES (?, ?, ?, ?, ?)`,
        [
          MASTER_DATA_TYPE_PROMO,
          promo.id,
          promo.title,
          this.buildPromoRule(promo),
          index + 1,
        ],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const codes = PROMOS.map((promo) => promo.id);
    const placeholders = codes.map(() => '?').join(', ');

    await queryRunner.query(
      `DELETE FROM \`tb_master_data\`
       WHERE \`type\` = ? AND \`code\` IN (${placeholders})`,
      [MASTER_DATA_TYPE_PROMO, ...codes],
    );
  }

  private buildPromoRule(promo: PromoSeed): string {
    return JSON.stringify({
      id: promo.id,
      title: promo.title,
      subtitle: promo.subtitle,
      code: promo.code,
      discount: promo.discount,
      expiry: promo.expiry,
      bg: promo.bg,
      textColor: promo.textColor,
    });
  }
}
