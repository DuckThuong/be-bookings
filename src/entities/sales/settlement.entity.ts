import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tb_settlement')
export class TbSettlement {
  @PrimaryGeneratedColumn('increment', {
    comment: 'Primary key',
    type: 'int',
    name: 'id',
  })
  id: number;

  @Column('varchar', {
    length: 24,
    unique: true,
    comment: 'Mã đối soát',
  })
  code: string;

  @Column({
    type: 'int',
    comment: 'ID công ty (tb_company)',
  })
  companyId: number;

  @Column({
    type: 'date',
    comment: 'Ngày bắt đầu kỳ',
  })
  periodFrom: string;

  @Column({
    type: 'date',
    comment: 'Ngày kết thúc kỳ',
  })
  periodTo: string;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
    comment: 'Tổng doanh số kỳ',
  })
  totalSales: number;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
    comment: 'Tổng hoa hồng platform',
  })
  totalCommission: number;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
    comment: 'Số tiền chuyển cho nhà xe',
  })
  payoutAmount: number;

  @Column({
    type: 'varchar',
    length: 50,
    comment: 'Trạng thái: DRAFT, PAID',
  })
  status: string;

  @Column({
    type: 'datetime',
    nullable: true,
    comment: 'Thời điểm thanh toán cho nhà xe',
  })
  paidAt: Date;

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
