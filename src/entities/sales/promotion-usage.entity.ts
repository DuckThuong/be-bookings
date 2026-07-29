import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TbBooking } from './booking.entity';
import { TbCompany } from '../company/company.entity';
import { TbTicket } from '../ticket.entity';

@Entity('tb_promotion_usage')
export class TbPromotionUsage {
  @PrimaryGeneratedColumn('increment', { type: 'int', name: 'id' })
  id: number;

  @ManyToOne(() => TbTicket, (ticket) => ticket.promotionUsages)
  ticket: TbTicket;

  @ManyToOne(() => TbBooking, (booking) => booking.promotionUsages)
  booking: TbBooking;

  @ManyToOne(() => TbCompany, (company) => company.promotionUsages)
  company: TbCompany;

  @Column({ type: 'int', nullable: true })
  ticketId: number;

  @Column({ type: 'int', nullable: true })
  bookingId: number;

  @Column({ type: 'varchar', length: 50 })
  promoCode: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  discountAmount: number;

  @Column({ type: 'int' })
  companyId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
