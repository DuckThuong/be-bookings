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
import { TbTrip } from './trip.entity';
import { TbCompany } from './company/company.entity';
import { TbBooking } from './sales/booking.entity';
import { TbPayment } from './sales/payment.entity';
import { TbRefund } from './sales/refund.entity';
import { TbPromotionUsage } from './sales/promotion-usage.entity';

@Entity('tb_ticket')
export class TbTicket {
  @PrimaryGeneratedColumn('increment', { type: 'int', name: 'id' })
  id: number;

  @ManyToOne(() => TbTrip, (trip) => trip.tickets)
  @JoinColumn({ name: 'trip_id', referencedColumnName: 'id' })
  trip: TbTrip;

  @ManyToOne(() => TbCompany, (company) => company.tickets)
  @JoinColumn({ name: 'company_id', referencedColumnName: 'id' })
  company: TbCompany;

  @ManyToOne(() => TbBooking, (booking) => booking.tickets)
  @JoinColumn({ name: 'booking_id', referencedColumnName: 'id' })
  booking: TbBooking;

  @OneToMany(() => TbPayment, (payment) => payment.ticket)
  payments: TbPayment[];

  @OneToMany(() => TbRefund, (refund) => refund.ticket)
  refunds: TbRefund[];

  @OneToMany(() => TbPromotionUsage, (usage) => usage.ticket)
  promotionUsages: TbPromotionUsage[];

  @Column('varchar', { length: 24, unique: true })
  code: string;

  @Column({ type: 'int' })
  tripId: number;

  @Column({ type: 'int' })
  companyId: number;

  @Column({ type: 'varchar', length: 24 })
  customerId: string;

  @Column({ type: 'varchar', length: 50 })
  status: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  pricePerSeat: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalPrice: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  promoCode: string;

  @Column({ type: 'int', nullable: true })
  bookingId: number;

  @Column({ type: 'int', default: 0 })
  totalSeat: number;

  @Column({ type: 'json' })
  seatIds: number[];

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
