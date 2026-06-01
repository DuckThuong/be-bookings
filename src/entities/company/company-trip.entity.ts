import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tb_company_trip')
export class TbCompanyTrip {
  @PrimaryGeneratedColumn('increment', {
    comment: 'Primary key',
    type: 'int',
    name: 'id',
  })
  id: number;

  @Column({
    type: 'int',
    comment: 'ID công ty',
  })
  companyId: number;

  @Column({
    type: 'int',
    comment: 'ID chuyến (tb_trip)',
  })
  tripId: number;

  @Column({
    type: 'int',
    comment: 'ID phương tiện (tb_vehicle)',
  })
  vehicleId: number;

  @Column({
    type: 'int',
    comment: 'ID tài xế (tb_driver)',
  })
  driverId: number;

  @Column({
    type: 'text',
    comment: 'Mô tả',
  })
  description: string;

  @Column({
    type: 'int',
    comment: 'Tổng số ghế',
  })
  totalSeat: number;

  @Column({
    type: 'int',
    comment: 'Tổng số ghế đã đặt',
  })
  totalSeatBooked: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    comment: 'Tổng doanh thu chuyến',
  })
  totalPrice: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    comment: 'Giá mỗi ghế',
  })
  pricePerSeat: number;

  @Column({
    type: 'varchar',
    comment: 'Trạng thái',
  })
  status: string;

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
