import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TbBasicUser } from './basic-user.entity';

@Entity('tb_info_user')
export class TbInfoUser {
  @PrimaryGeneratedColumn('increment', { type: 'int', name: 'id' })
  id: number;

  @OneToOne(() => TbBasicUser, (user) => user.infoUser)
  @JoinColumn({ name: 'basic_user_id' })
  basicUser: TbBasicUser;

  @Column({ type: 'varchar', length: 255 })
  avatar: string;

  @Column('varchar', { length: 24, unique: true })
  userCode: string;

  @Column({ type: 'varchar', length: 100 })
  userName: string;

  @Column({ type: 'date' })
  userDob: string;

  @Column({ type: 'int' })
  userGender: number;
}
