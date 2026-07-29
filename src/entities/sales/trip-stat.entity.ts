import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TbTrip } from '../trip.entity';
import { TbCompany } from '../company/company.entity';

@Entity('tb_trip_stat')
export class TbTripStat {
  @PrimaryGeneratedColumn('increment', { type: 'int', name: 'id' })
  id: number;

  @ManyToOne(() => TbTrip, (trip) => trip.tripStats)
  trip: TbTrip;

  @ManyToOne(() => TbCompany, (company) => company.tripStats)
  company: TbCompany;

  @Column({ type: 'int' })
  tripId: number;

  @Column({ type: 'int' })
  companyId: number;

  @Column({ type: 'date' })
  statDate: string;

  @Column({ type: 'int', default: 0 })
  ticketCount: number;

  @Column({ type: 'int', default: 0 })
  seatSold: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  grossRevenue: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  discountTotal: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  netRevenue: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  refundTotal: number;

  @Column({ type: 'int', default: 0 })
  cancelledCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  occupancyRate: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
