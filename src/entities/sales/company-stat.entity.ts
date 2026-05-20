import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tb_company_stat')
export class TbCompanyStat {
  @PrimaryGeneratedColumn('increment', {
    comment: 'Primary key',
    type: 'int',
    name: 'id',
  })
  id: number;

  @Column({
    type: 'int',
    comment: 'ID công ty (tb_company)',
  })
  companyId: number;

  @Column({
    type: 'date',
    comment: 'Ngày thống kê',
  })
  statDate: string;

  @Column({
    type: 'int',
    default: 0,
    comment: 'Số vé đã thanh toán',
  })
  ticketCount: number;

  @Column({
    type: 'int',
    default: 0,
    comment: 'Tổng số ghế bán',
  })
  seatSold: number;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
    comment: 'Doanh thu gộp (trước giảm giá)',
  })
  grossRevenue: number;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
    comment: 'Tổng tiền giảm giá',
  })
  discountTotal: number;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
    comment: 'Doanh thu ròng (đã thu - hoàn)',
  })
  netRevenue: number;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
    comment: 'Tổng tiền hoàn',
  })
  refundTotal: number;

  @Column({
    type: 'int',
    default: 0,
    comment: 'Số vé hủy',
  })
  cancelledCount: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    comment: 'Tỷ lệ lấp đầy ghế (%)',
  })
  occupancyRate: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    comment: 'Giá trị trung bình mỗi vé',
  })
  avgTicketValue: number;

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
