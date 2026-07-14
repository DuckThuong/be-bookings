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
import { TbPromotionUsage } from './promotion-usage.entity';
import { TbTicket } from '../ticket.entity';

@Entity('tb_booking')
export class TbBooking {
  @PrimaryGeneratedColumn('increment', { type: 'int', name: 'id' })
  id: number;

  @ManyToOne(() => TbTrip, (trip) => trip.bookings)
  @JoinColumn({ name: 'trip_id' })
  trip: TbTrip;

  @ManyToOne(() => TbCompany, (company) => company.bookings)
  @JoinColumn({ name: 'company_id' })
  company: TbCompany;

  @OneToMany(() => TbTicket, (ticket) => ticket.booking)
  tickets: TbTicket[];

  @OneToMany(() => TbPromotionUsage, (usage) => usage.booking)
  promotionUsages: TbPromotionUsage[];

  @Column('varchar', { length: 24, unique: true })
  code: string;

  @Column({ type: 'int' })
  tripId: number;

  @Column({ type: 'int' })
  companyId: number;

  @Column({ type: 'varchar', length: 24 })
  customerId: string;

  @Column({ type: 'json' })
  seatIds: number[];

  @Column({ type: 'int', default: 0 })
  totalSeat: number;

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

  @Column({ type: 'varchar', length: 50 })
  status: string;

  @Column({ type: 'datetime' })
  holdExpiresAt: Date;

  @Column({ type: 'int', nullable: true })
  ticketId: number;

  @Column({ type: 'json', nullable: true })
  passenger: {
    fullName: string;
    phone: string;
    pickupPoint: string;
    dropoffPoint: string;
  } | null;

  @Column({ type: 'json', nullable: true })
  addons: {
    id: string;
    name: string;
    price: number;
    qty?: number;
  }[];

  @Column({ name: 'service_fee', type: 'decimal', precision: 12, scale: 2, default: 0 })
  serviceFee: number;

  @Column({ name: 'addons_total', type: 'decimal', precision: 12, scale: 2, default: 0 })
  addonsTotal: number;

  @Column({ name: 'vehicle_type', type: 'varchar', length: 10, nullable: true })
  vehicleType: string;

  @Column({ type: 'int', nullable: true })
  floor: number;

  @Column({ name: 'payment_method_id', type: 'varchar', length: 20, nullable: true })
  paymentMethodId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
