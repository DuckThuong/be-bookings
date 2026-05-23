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
    type: 'varchar',
    length: 50,
    comment: 'Trạng thái chuyến',
  })
  status: string;

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
}
