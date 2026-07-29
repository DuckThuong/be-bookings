import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TbCompany } from './company/company.entity';
import { TbTrip } from './trip.entity';

@Entity('tb_driver')
export class TbDriver {
  @PrimaryGeneratedColumn('increment', { type: 'int', name: 'id' })
  id: number;

  @ManyToOne(() => TbCompany, (company) => company.drivers)
  company: TbCompany;

  @OneToMany(() => TbTrip, (trip) => trip.driver)
  trips: TbTrip[];

  @Column('varchar', { length: 24, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  license: string;

  @Column({ type: 'varchar', length: 50 })
  licenseNum: string;

  @Column({ type: 'varchar', length: 50 })
  phone: string;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 50 })
  status: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rate: number;

  @Column({ type: 'int', default: 0 })
  totalTurn: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
