import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  CONTACTS,
  ContactSeed,
  MASTER_DATA_TYPE_CONTACT,
} from './contact.data';

export class Contact1747741200004 implements MigrationInterface {
  name = 'Contact1747741200004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const [index, contact] of CONTACTS.entries()) {
      await queryRunner.query(
        `INSERT INTO \`tb_master_data\` (\`type\`, \`code\`, \`name\`, \`rule\`, \`sort\`)
         VALUES (?, ?, ?, ?, ?)`,
        [
          MASTER_DATA_TYPE_CONTACT,
          contact.id,
          contact.label,
          this.buildContactRule(contact),
          index + 1,
        ],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const codes = CONTACTS.map((contact) => contact.id);
    const placeholders = codes.map(() => '?').join(', ');

    await queryRunner.query(
      `DELETE FROM \`tb_master_data\`
       WHERE \`type\` = ? AND \`code\` IN (${placeholders})`,
      [MASTER_DATA_TYPE_CONTACT, ...codes],
    );
  }

  private buildContactRule(contact: ContactSeed): string {
    return JSON.stringify({
      id: contact.id,
      label: contact.label,
      value: contact.value,
      note: contact.note,
    });
  }
}
