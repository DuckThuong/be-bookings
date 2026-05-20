import { MigrationInterface, QueryRunner } from 'typeorm';
import { FAQS, FaqSeed, MASTER_DATA_TYPE_FAQ } from './faq.data';

export class Faq1747741200003 implements MigrationInterface {
  name = 'Faq1747741200003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const [index, faq] of FAQS.entries()) {
      await queryRunner.query(
        `INSERT INTO \`tb_master_data\` (\`type\`, \`code\`, \`name\`, \`rule\`, \`sort\`)
         VALUES (?, ?, ?, ?, ?)`,
        [
          MASTER_DATA_TYPE_FAQ,
          faq.id,
          faq.q,
          this.buildFaqRule(faq),
          index + 1,
        ],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const codes = FAQS.map((faq) => faq.id);
    const placeholders = codes.map(() => '?').join(', ');

    await queryRunner.query(
      `DELETE FROM \`tb_master_data\`
       WHERE \`type\` = ? AND \`code\` IN (${placeholders})`,
      [MASTER_DATA_TYPE_FAQ, ...codes],
    );
  }

  private buildFaqRule(faq: FaqSeed): string {
    return JSON.stringify({
      id: faq.id,
      q: faq.q,
      a: faq.a,
    });
  }
}
