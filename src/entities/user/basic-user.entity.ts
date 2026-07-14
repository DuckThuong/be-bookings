import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRole, UserStatus } from '../../dtos/user/common.dto';
import { TbInfoUser } from './info-user.entity';

@Entity('tb_basic_user')
export class TbBasicUser {
  @PrimaryGeneratedColumn('increment', { type: 'int', name: 'id' })
  id: number;

  @OneToOne(() => TbInfoUser, (info) => info.basicUser)
  infoUser: TbInfoUser;

  @Column('varchar', { length: 24, unique: true })
  userCode: string;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 50 })
  phone: string;

  @Column({ type: 'varchar', length: 255, select: true })
  password: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;
}
