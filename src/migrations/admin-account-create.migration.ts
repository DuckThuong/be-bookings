import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdminAccountCreate1752050000000 implements MigrationInterface {
  name = 'AdminAccountCreate1752050000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO tb_basic_user (userCode, email, phone, password, status, role, isEmailVerified)
       VALUES ('ADMIN', 'admin@gmail.com', '0100000001', '123456', '0', '0', true)`,
    );

    // Get the inserted user ID
    const [user] = await queryRunner.query(
      `SELECT id FROM tb_basic_user WHERE email = 'admin@gmail.com'`,
    );

    // Insert into tb_info_user with the same ID
    await queryRunner.query(
      `INSERT INTO tb_info_user (id, basic_user_id, avatar, userCode, userName, userDob, userGender)
       VALUES (${user.id}, ${user.id}, '', 'ADMIN', 'Administrator', '1990-01-01', 1)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM tb_info_user WHERE userCode = 'ADMIN001'`,
    );
    await queryRunner.query(
      `DELETE FROM tb_basic_user WHERE email = 'admin@gmail.com'`,
    );
  }
}
