import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('tb_promotion_usage')
export class TbPromotionUsage {
  @PrimaryGeneratedColumn('increment', {
    comment: 'Primary key',
    type: 'int',
    name: 'id',
  })
  id: number;

  @Column({
    type: 'int',
    nullable: true,
    comment: 'ID vé (tb_ticket)',
  })
  ticketId: number;

  @Column({
    type: 'int',
    nullable: true,
    comment: 'ID đặt chỗ (tb_booking)',
  })
  bookingId: number;

  @Column({
    type: 'varchar',
    length: 50,
    comment: 'Mã khuyến mãi',
  })
  promoCode: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    comment: 'Số tiền được giảm',
  })
  discountAmount: number;

  @Column({
    type: 'int',
    comment: 'ID công ty (tb_company)',
  })
  companyId: number;

  @CreateDateColumn({
    name: 'created_at',
    comment: 'Ngày áp dụng',
  })
  createdAt: Date;
}
