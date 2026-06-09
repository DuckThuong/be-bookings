import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tb_payment')
export class TbPayment {
  @PrimaryGeneratedColumn('increment', {
    comment: 'Primary key',
    type: 'int',
    name: 'id',
  })
  id: number;

  @Column('varchar', {
    length: 24,
    unique: true,
    comment: 'Mã giao dịch',
  })
  code: string;

  @Column({
    type: 'int',
    comment: 'ID vé (tb_ticket)',
  })
  ticketId: number;

  @Column({
    type: 'int',
    comment: 'ID chuyến (tb_trip)',
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
    type: 'decimal',
    precision: 12,
    scale: 2,
    comment: 'Số tiền thanh toán',
  })
  amount: number;

  @Column({
    type: 'varchar',
    length: 50,
    comment: 'Phương thức: CASH, BANK, MOMO, ...',
  })
  method: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: 'Trạng thái: PENDING, SUCCESS, FAILED',
  })
  status: string;

  @Column({
    type: 'datetime',
    nullable: true,
    comment: 'Thời điểm thanh toán thành công',
  })
  paidAt: Date;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Mã tham chiếu cổng thanh toán / bill',
  })
  transactionRef: string;

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
