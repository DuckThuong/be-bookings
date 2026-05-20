import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tb_booking')
export class TbBooking {
  @PrimaryGeneratedColumn('increment', {
    comment: 'Primary key',
    type: 'int',
    name: 'id',
  })
  id: number;

  @Column('varchar', {
    length: 24,
    unique: true,
    comment: 'Mã đặt chỗ',
  })
  code: string;

  @Column({
    type: 'int',
    comment: 'ID chuyến nhà xe (tb_company_trip)',
  })
  companyTripId: number;

  @Column({
    type: 'int',
    comment: 'ID chuyến mẫu (tb_trip)',
  })
  tripId: number;

  @Column({
    type: 'int',
    comment: 'ID công ty (tb_company)',
  })
  companyId: number;

  @Column({
    type: 'varchar',
    length: 24,
    comment: 'Mã khách hàng (userCode)',
  })
  customerId: string;

  @Column({
    type: 'json',
    comment: 'Danh sách ID ghế giữ chỗ (tb_seat.id)',
  })
  seatIds: number[];

  @Column({
    type: 'int',
    default: 0,
    comment: 'Số ghế giữ',
  })
  totalSeat: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    comment: 'Giá mỗi ghế',
  })
  pricePerSeat: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    comment: 'Tổng tiền trước giảm giá',
  })
  subtotal: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    comment: 'Số tiền giảm giá',
  })
  discountAmount: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    comment: 'Tổng tiền sau giảm giá',
  })
  totalPrice: number;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'Mã khuyến mãi',
  })
  promoCode: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: 'Trạng thái: HOLD, EXPIRED, CONVERTED, CANCELLED',
  })
  status: string;

  @Column({
    type: 'datetime',
    comment: 'Thời điểm hết hạn giữ chỗ',
  })
  holdExpiresAt: Date;

  @Column({
    type: 'int',
    nullable: true,
    comment: 'ID vé sau khi chuyển đổi (tb_ticket)',
  })
  ticketId: number;

  @CreateDateColumn({
    name: 'created_at',
    comment: 'Ngày tạo',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    comment: 'Ngày cập nhật',
  })
  updatedAt: Date;
}
