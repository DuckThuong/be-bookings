import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tb_commission')
export class TbCommission {
  @PrimaryGeneratedColumn('increment', {
    comment: 'Primary key',
    type: 'int',
    name: 'id',
  })
  id: number;

  @Column({
    type: 'int',
    comment: 'ID thanh toán (tb_payment)',
  })
  paymentId: number;

  @Column({
    type: 'int',
    comment: 'ID công ty (tb_company)',
  })
  companyId: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    comment: 'Tiền vé gốc',
  })
  ticketAmount: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    comment: 'Tỷ lệ hoa hồng (%)',
  })
  commissionRate: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    comment: 'Số tiền hoa hồng platform',
  })
  commissionAmount: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    comment: 'Số tiền nhà xe nhận',
  })
  companyAmount: number;

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
