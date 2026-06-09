import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tb_trip_stat')
export class TbTripStat {
  @PrimaryGeneratedColumn('increment', {
    comment: 'Primary key',
    type: 'int',
    name: 'id',
  })
  id: number;

  @Column({
    type: 'int',
    comment: 'Trip ID (tb_trip)',
  })
  tripId: number;

  @Column({
    type: 'int',
    comment: 'Company ID (tb_company)',
  })
  companyId: number;

  @Column({
    type: 'date',
    comment: 'Stat date',
  })
  statDate: string;

  @Column({
    type: 'int',
    default: 0,
    comment: 'Paid ticket count',
  })
  ticketCount: number;

  @Column({
    type: 'int',
    default: 0,
    comment: 'Total sold seats',
  })
  seatSold: number;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
    comment: 'Gross revenue',
  })
  grossRevenue: number;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
    comment: 'Total discount amount',
  })
  discountTotal: number;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
    comment: 'Net revenue',
  })
  netRevenue: number;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
    comment: 'Total refund amount',
  })
  refundTotal: number;

  @Column({
    type: 'int',
    default: 0,
    comment: 'Cancelled ticket count',
  })
  cancelledCount: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    comment: 'Occupancy rate (%)',
  })
  occupancyRate: number;

  @CreateDateColumn({
    name: 'created_at',
    comment: 'Created date',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    comment: 'Updated date',
  })
  updatedAt: Date;
}
