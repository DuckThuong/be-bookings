import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TbCompany } from './company/company.entity';
import { TbTrip } from './trip.entity';

@Entity('tb_road')
export class TbRoad {
  @PrimaryGeneratedColumn('increment', { type: 'int', name: 'id' })
  id: number;

  @ManyToOne(() => TbCompany, (company) => company.roads)
  @JoinColumn({ name: 'company_id', referencedColumnName: 'id' })
  company: TbCompany;

  @OneToMany(() => TbTrip, (trip) => trip.road)
  trips: TbTrip[];

  @Column({ name: 'company_id', type: 'int' })
  companyId: number;

  @Column('varchar', { length: 24, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  length: number;

  @Column({ type: 'varchar', length: 50 })
  status: string;

  @Column({ type: 'varchar', length: 255 })
  startPoint: string;

  @Column({ type: 'varchar', length: 255 })
  endPoint: string;

  @Column({ type: 'text' })
  pickUpPoint: string;

  @Column({ type: 'text' })
  dropOffPoint: string;

  @Column({ type: 'int', default: 0 })
  totalTurn: number;

  @Column({ type: 'varchar', length: 50, default: '' })
  standardDuration: string;

  @Column({ type: 'int', default: 0 })
  tripsPerDay: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  averageOccupancy: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  estimatedRevenue: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  leadVehicle: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  demandLevel: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  note: string | null;
}
