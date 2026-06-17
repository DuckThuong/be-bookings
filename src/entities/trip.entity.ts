import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tb_trip')
export class TbTrip {
  @PrimaryGeneratedColumn('increment', {
    comment: 'Primary key',
    type: 'int',
    name: 'id',
  })
  id: number;

  @Column('varchar', {
    length: 24,
    unique: true,
    comment: 'Mã chuyến',
  })
  code: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Tên chuyến',
  })
  name: string;

  @Column({
    type: 'int',
    comment: 'ID tuyến đường (tb_road)',
  })
  roadId: number;

  @Column({
    type: 'int',
    comment: 'ID công ty (tb_company)',
  })
  companyId: number;

  @Column({
    type: 'int',
    comment: 'ID tài xế (tb_driver)',
  })
  driverId: number;

  @Column({
    type: 'int',
    comment: 'ID xe (tb_vehicle)',
  })
  vehicleId: number;

  @Column({
    type: 'varchar',
    length: 50,
    comment: 'Trạng thái chuyến',
  })
  status: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'SCHEDULED',
    comment: 'Trạng thái vận hành chuyến (SCHEDULED, PREPARING, BOARDING, DEPARTED, APPROACHING, MOVING, ARRIVED, COMPLETED, CANCELLED, DELAYED)',
  })
  operationStatus: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Mô tả / ghi chú chuyến',
  })
  description: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: '',
    comment: 'Giờ / thời điểm khởi hành chuyến',
  })
  departure: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: '',
    comment: 'Giờ / thời điểm đến chuyến',
  })
  arrival: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: 'Giá vé/chỗ ngồi(vnđ)',
  })
  seatPrice: string;

  @Column({
    type: 'int',
    default: 0,
    comment: 'Tổng số ghế đã đặt',
  })
  bookedSeats: number;
}
