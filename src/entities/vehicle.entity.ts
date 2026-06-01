import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { VehicleLayoutConfig } from '../common/seat-layout/seat-layout';

@Entity('tb_vehicle')
export class TbVehicle {
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
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'Ảnh phương tiện',
  })
  image: string;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    comment: 'Biển số phương tiện',
  })
  code: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: 'Loại phương tiện',
  })
  type: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Lịch trình phương tiện',
  })
  schedule: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: 'Trạng thái phương tiện',
  })
  status: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Tên phương tiện',
  })
  name: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Mô tả phương tiện',
  })
  description: string;

  @Column({ type: 'int', default: 0 })
  seatCount: number;

  @Column({
    name: 'layout_config',
    type: 'json',
    nullable: true,
    comment: 'Cấu hình ma trận ghế/lối đi',
  })
  layoutConfig?: VehicleLayoutConfig | null;
}
