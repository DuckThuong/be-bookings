import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tb_seat')
export class TbSeat {
  @PrimaryGeneratedColumn('increment', {
    comment: 'Primary key',
    type: 'int',
    name: 'id',
  })
  id: number;

  @Column({
    type: 'int',
    comment: 'ID phương tiện (tb_vehicle)',
  })
  vehicleId: number;

  @Column('varchar', {
    length: 24,
    unique: true,
    comment: 'Mã ghế',
  })
  code: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: 'Loại ghế',
  })
  type: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: 'Tên ghế',
  })
  name: string;

  @Column({
    name: 'seat_index',
    type: 'varchar',
    length: 20,
    comment: 'Vị trí ghế (hàng/cột)',
  })
  index: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: 'Trạng thái ghế',
  })
  status: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Mô tả ghế',
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
