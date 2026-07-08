import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { VehicleLayoutConfig } from '../common/seat-layout/seat-layout';
import { TbCompany } from './company/company.entity';
import { TbSeat } from './seat.entity';
import { TbTrip } from './trip.entity';

@Entity('tb_vehicle')
export class TbVehicle {
  @PrimaryGeneratedColumn('increment', { type: 'int', name: 'id' })
  id: number;

  @ManyToOne(() => TbCompany, (company) => company.vehicles)
  @JoinColumn({ name: 'company_id', referencedColumnName: 'id' })
  company: TbCompany;

  @Column({ type: 'int' })
  companyId: number;

  @OneToMany(() => TbSeat, (seat) => seat.vehicle)
  seats: TbSeat[];

  @OneToMany(() => TbTrip, (trip) => trip.vehicle)
  trips: TbTrip[];

  @Column({ type: 'varchar', length: 500, nullable: true })
  image: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  schedule: string;

  @Column({ type: 'varchar', length: 50 })
  status: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 0 })
  seatCount: number;

  @Column({ name: 'layout_config', type: 'json', nullable: true })
  layoutConfig?: VehicleLayoutConfig | null;
}
