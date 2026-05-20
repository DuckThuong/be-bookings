import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  MASTER_DATA_TYPE_OPERATOR,
  OPERATORS,
  OperatorSeed,
} from './operator.data';

export class Operator1747741200002 implements MigrationInterface {
  name = 'Operator1747741200002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const [index, operator] of OPERATORS.entries()) {
      await queryRunner.query(
        `INSERT INTO \`tb_master_data\` (\`type\`, \`code\`, \`name\`, \`rule\`, \`sort\`)
         VALUES (?, ?, ?, ?, ?)`,
        [
          MASTER_DATA_TYPE_OPERATOR,
          operator.id,
          operator.name,
          this.buildOperatorRule(operator),
          index + 1,
        ],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const codes = OPERATORS.map((operator) => operator.id);
    const placeholders = codes.map(() => '?').join(', ');

    await queryRunner.query(
      `DELETE FROM \`tb_master_data\`
       WHERE \`type\` = ? AND \`code\` IN (${placeholders})`,
      [MASTER_DATA_TYPE_OPERATOR, ...codes],
    );
  }

  private buildOperatorRule(operator: OperatorSeed): string {
    return JSON.stringify({
      id: operator.id,
      name: operator.name,
      logo: operator.logo,
      rating: operator.rating,
      reviews: operator.reviews,
      routes: operator.routes,
      badge: operator.badge,
    });
  }
}
