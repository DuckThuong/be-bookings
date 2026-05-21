import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole, UserStatus } from '../../dtos/user/common.dto';
import { TbCompany } from "../company/company.entity";

@Entity('tb_basic_user')
export class TbBasicUser {
  @PrimaryGeneratedColumn('increment', {
    comment: 'Primary key',
    type: 'int',
    name: 'id',
  })
  id: number;

  @Column('varchar', {
    comment: 'Mã người dùng',
    length: 24,
    unique: true,
  })
  userCode: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: 'User email',
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: 'Số điện thoại của người dùng',
  })
  phone: string;

  @Column({
    type: 'varchar',
    length: 255,
    select: true,
    comment: 'Hashed password',
  })
  password: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
    comment: 'User status',
  })
  status: UserStatus;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
    comment: 'User role',
  })
  role: UserRole;

  @Column({
    type: 'boolean',
    default: false,
    comment: 'Is email verified',
  })
  isEmailVerified: boolean;
}
