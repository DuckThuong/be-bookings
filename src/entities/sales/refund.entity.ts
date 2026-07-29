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
import { TbTrip } from '../trip.entity';
import { TbCompany } from '../company/company.entity';
import { TbTicket } from '../ticket.entity';

@Entity('tb_refund')
export class TbRefund {
  @PrimaryGeneratedColumn('increment', { type: 'int', name: 'id' })
  id: number;

  @ManyToOne(() => TbPayment, (payment) => payment.refunds)
  payment: TbPayment;

  @ManyToOne(() => TbTicket, (ticket) => ticket.refunds)
  ticket: TbTicket;

  @ManyToOne(() => TbTrip, (trip) => trip.refunds)
  trip: TbTrip;

  @ManyToOne(() => TbCompany, (company) => company.refunds)
  company: TbCompany;

  @Column('varchar', { length: 24, unique: true })
  code: string;

  @Column({ type: 'int' })
  paymentId: number;

  @Column({ type: 'int' })
  ticketId: number;

  @Column({ type: 'int' })
  tripId: number;

  @Column({ type: 'int' })
  companyId: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  customerId: string;

  @Column({ type: 'int', nullable: true })
  userId: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  refundPercentage: number;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'varchar', length: 50 })
  status: string;

  @Column({ type: 'datetime', nullable: true })
  refundedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  cancelledAt: Date;

  @Column({ type: 'datetime', nullable: true })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
