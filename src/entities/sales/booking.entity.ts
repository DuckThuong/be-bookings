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

  @Column({
    type: 'json',
    nullable: true,
    comment: 'Thông tin hành khách',
  })
  passenger: {
    fullName: string;
    phone: string;
    pickupPoint: string;
    dropoffPoint: string;
  } | null;

  @Column({
    type: 'json',
    nullable: true,
    comment: 'Dịch vụ thêm',
  })
  addons: {
    id: string;
    name: string;
    price: number;
    qty?: number;
  }[];

  @Column({
    name: 'service_fee',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    comment: 'Phí dịch vụ',
  })
  serviceFee: number;

  @Column({
    name: 'addons_total',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    comment: 'Tổng tiền addon',
  })
  addonsTotal: number;

  @Column({
    name: 'vehicle_type',
    type: 'varchar',
    length: 10,
    nullable: true,
    comment: 'Loại xe FE',
  })
  vehicleType: string;

  @Column({
    type: 'int',
    nullable: true,
    comment: 'Tầng xe',
  })
  floor: number;

  @Column({
    name: 'payment_method_id',
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: 'Phương thức thanh toán FE',
  })
  paymentMethodId: string;

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
