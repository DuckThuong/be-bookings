import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tb_ticket')
export class TbTicket {
  @PrimaryGeneratedColumn('increment', {
    comment: 'Primary key',
    type: 'int',
    name: 'id',
  })
  id: number;

  @Column('varchar', {
    length: 24,
    unique: true,
    comment: 'Mã vé',
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
    type: 'varchar',
    length: 24,
    comment: 'Mã khách hàng (userCode)',
  })
  customerId: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: 'Trạng thái vé',
  })
  status: string;

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
    comment: 'Tổng tiền',
  })
  totalPrice: number;

  @Column({
    type: 'int',
    default: 0,
    comment: 'Tổng số ghế',
  })
  totalSeat: number;

  @Column({
    type: 'json',
    comment: 'Danh sách ID ghế đã chọn (tb_seat.id)',
  })
  seatIds: number[];

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Mô tả vé',
  })
  description: string;

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
