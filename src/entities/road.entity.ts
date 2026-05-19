import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tb_road')
export class TbRoad {
  @PrimaryGeneratedColumn('increment', {
    comment: 'Primary key',
    type: 'int',
    name: 'id',
  })
  id: number;

  @Column('varchar', {
    length: 24,
    unique: true,
    comment: 'Mã tuyến đường',
  })
  code: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Tên tuyến đường',
  })
  name: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: 'Chiều dài tuyến (km)',
  })
  length: number;

  @Column({
    type: 'varchar',
    length: 50,
    comment: 'Loại tuyến đường',
  })
  type: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: 'Trạng thái tuyến đường',
  })
  status: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Điểm xuất phát',
  })
  startPoint: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Điểm kết thúc',
  })
  endPoint: string;

  @Column({
    type: 'varchar',
    length: 20,
    comment: 'Giờ khởi hành',
  })
  startTime: string;

  @Column({
    type: 'varchar',
    length: 20,
    comment: 'Giờ kết thúc',
  })
  endTime: string;

  @Column({
    type: 'int',
    default: 0,
    comment: 'Tổng số chuyến',
  })
  totalTurn: number;
}
