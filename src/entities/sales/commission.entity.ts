import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TbPayment } from './payment.entity';
import { TbCompany } from '../company/company.entity';

@Entity('tb_commission')
export class TbCommission {
  @PrimaryGeneratedColumn('increment', { type: 'int', name: 'id' })
  id: number;

  @ManyToOne(() => TbPayment, (payment) => payment.commissions)
  @JoinColumn({ name: 'payment_id' })
  payment: TbPayment;

  @ManyToOne(() => TbCompany, (company) => company.commissions)
  @JoinColumn({ name: 'company_id' })
  company: TbCompany;

  @Column({ type: 'int' })
  paymentId: number;

  @Column({ type: 'int' })
  companyId: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  ticketAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  commissionRate: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  commissionAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  companyAmount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
