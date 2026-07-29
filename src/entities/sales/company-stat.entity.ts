import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TbCompany } from '../company/company.entity';

@Entity('tb_company_stat')
export class TbCompanyStat {
  @PrimaryGeneratedColumn('increment', { type: 'int', name: 'id' })
  id: number;

  @ManyToOne(() => TbCompany, (company) => company.companyStats)
  company: TbCompany;

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

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  avgTicketValue: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
