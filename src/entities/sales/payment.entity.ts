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
import { TbTrip } from '../trip.entity';
import { TbCompany } from '../company/company.entity';
import { TbRefund } from './refund.entity';
import { TbCommission } from './commission.entity';
import { TbTicket } from '../ticket.entity';

@Entity('tb_payment')
export class TbPayment {
  @PrimaryGeneratedColumn('increment', { type: 'int', name: 'id' })
  id: number;

  @ManyToOne(() => TbTicket, (ticket) => ticket.payments)
  @JoinColumn({ name: 'ticket_id' })
  ticket: TbTicket;

  @ManyToOne(() => TbTrip, (trip) => trip.payments)
  @JoinColumn({ name: 'trip_id' })
  trip: TbTrip;

  @ManyToOne(() => TbCompany, (company) => company.payments)
  @JoinColumn({ name: 'company_id' })
  company: TbCompany;

  @OneToMany(() => TbRefund, (refund) => refund.payment)
  refunds: TbRefund[];

  @OneToMany(() => TbCommission, (commission) => commission.payment)
  commissions: TbCommission[];

  @Column('varchar', { length: 24, unique: true })
  code: string;

  @Column({ type: 'int' })
  ticketId: number;

  @Column({ type: 'int' })
  tripId: number;

  @Column({ type: 'int' })
  companyId: number;

  @Column({ type: 'varchar', length: 24 })
  customerId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 50 })
  method: string;

  @Column({ type: 'varchar', length: 50 })
  status: string;

  @Column({ type: 'datetime', nullable: true })
  paidAt: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  transactionRef: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
