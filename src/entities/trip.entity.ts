import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TbCompany } from './company/company.entity';
import { TbDriver } from './driver.entity';
import { TbRoad } from './road.entity';
import { TbVehicle } from './vehicle.entity';
import { TbBooking } from './sales/booking.entity';
import { TbPayment } from './sales/payment.entity';
import { TbRefund } from './sales/refund.entity';
import { TbTripStat } from './sales/trip-stat.entity';
import { TbTicket } from './ticket.entity';

@Entity('tb_trip')
export class TbTrip {
  @PrimaryGeneratedColumn('increment', { type: 'int', name: 'id' })
  id: number;

  @ManyToOne(() => TbCompany, (company) => company.trips)
  company: TbCompany;

  @ManyToOne(() => TbRoad, (road) => road.trips)
  road: TbRoad;

  @ManyToOne(() => TbDriver, (driver) => driver.trips)
  driver: TbDriver;

  @ManyToOne(() => TbVehicle, (vehicle) => vehicle.trips)
  vehicle: TbVehicle;

  @OneToMany(() => TbBooking, (booking) => booking.trip)
  bookings: TbBooking[];

  @OneToMany(() => TbTicket, (ticket) => ticket.trip)
  tickets: TbTicket[];

  @OneToMany(() => TbPayment, (payment) => payment.trip)
  payments: TbPayment[];

  @OneToMany(() => TbRefund, (refund) => refund.trip)
  refunds: TbRefund[];

  @OneToMany(() => TbTripStat, (stat) => stat.trip)
  tripStats: TbTripStat[];

  @Column('varchar', { length: 24, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'int' })
  roadId: number;

  @Column({ type: 'int' })
  companyId: number;

  @Column({ type: 'int' })
  driverId: number;

  @Column({ type: 'int' })
  vehicleId: number;

  @Column({ type: 'varchar', length: 50 })
  status: string;

  @Column({ type: 'varchar', length: 50, default: 'SCHEDULED' })
  operationStatus: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50, default: '' })
  departure: string;

  @Column({ type: 'varchar', length: 50, default: '' })
  arrival: string;

  @Column({ type: 'varchar', length: 50 })
  seatPrice: string;

  @Column({ type: 'int', default: 0 })
  bookedSeats: number;
}
