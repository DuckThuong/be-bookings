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
import { TbDriver } from '../driver.entity';
import { TbRoad } from '../road.entity';
import { TbTrip } from '../trip.entity';
import { TbBasicUser } from '../user/basic-user.entity';
import { TbVehicle } from '../vehicle.entity';
import { TbBooking } from '../sales/booking.entity';
import { TbCommission } from '../sales/commission.entity';
import { TbCompanyStat } from '../sales/company-stat.entity';
import { TbPayment } from '../sales/payment.entity';
import { TbPromotionUsage } from '../sales/promotion-usage.entity';
import { TbRefund } from '../sales/refund.entity';
import { TbSettlement } from '../sales/settlement.entity';
import { TbTripStat } from '../sales/trip-stat.entity';
import { TbTicket } from '../ticket.entity';

@Entity('tb_company')
export class TbCompany {
  @PrimaryGeneratedColumn('increment', { type: 'int', name: 'id' })
  id: number;

  @ManyToOne(() => TbBasicUser, { nullable: true })
  @JoinColumn({ name: 'user_lead_id' })
  userLead: TbBasicUser;

  @Column({ name: 'user_lead_id', type: 'int' })
  userLeadId: number;

  @OneToMany(() => TbVehicle, (vehicle) => vehicle.company)
  vehicles: TbVehicle[];

  @OneToMany(() => TbDriver, (driver) => driver.company)
  drivers: TbDriver[];

  @OneToMany(() => TbRoad, (road) => road.company)
  roads: TbRoad[];

  @OneToMany(() => TbTrip, (trip) => trip.company)
  trips: TbTrip[];

  @OneToMany(() => TbBooking, (booking) => booking.company)
  bookings: TbBooking[];

  @OneToMany(() => TbTicket, (ticket) => ticket.company)
  tickets: TbTicket[];

  @OneToMany(() => TbPayment, (payment) => payment.company)
  payments: TbPayment[];

  @OneToMany(() => TbRefund, (refund) => refund.company)
  refunds: TbRefund[];

  @OneToMany(() => TbSettlement, (settlement) => settlement.company)
  settlements: TbSettlement[];

  @OneToMany(() => TbCommission, (commission) => commission.company)
  commissions: TbCommission[];

  @OneToMany(() => TbCompanyStat, (stat) => stat.company)
  companyStats: TbCompanyStat[];

  @OneToMany(() => TbTripStat, (stat) => stat.company)
  tripStats: TbTripStat[];

  @OneToMany(() => TbPromotionUsage, (usage) => usage.company)
  promotionUsages: TbPromotionUsage[];

  @Column({ type: 'varchar', length: 255 })
  companyName: string;

  @Column('varchar', { length: 24, unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
