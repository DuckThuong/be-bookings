import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tb_refund')
export class TbRefund {
  @PrimaryGeneratedColumn('increment', {
    comment: 'Primary key',
    type: 'int',
    name: 'id',
  })
  id: number;

  @Column('varchar', {
    length: 24,
    unique: true,
    comment: 'Mã hoàn tiền',
  })
  code: string;

  @Column({
    type: 'int',
    comment: 'ID thanh toán gốc (tb_payment)',
  })
  paymentId: number;

  @Column({
    type: 'int',
    comment: 'ID vé (tb_ticket)',
  })
  ticketId: number;

  @Column({
    type: 'int',
    comment: 'ID chuyến nhà xe (tb_company_trip)',
  })
  companyTripId: number;

  @Column({
    type: 'int',
    comment: 'ID công ty (tb_company)',
  })
  companyId: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    comment: 'Số tiền hoàn',
  })
  amount: number;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Lý do hoàn tiền',
  })
  reason: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: 'Trạng thái: PENDING, SUCCESS, REJECTED',
  })
  status: string;

  @Column({
    type: 'datetime',
    nullable: true,
    comment: 'Thời điểm hoàn tiền thành công',
  })
  refundedAt: Date;

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
