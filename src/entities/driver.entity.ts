import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tb_driver')
export class TbDriver {
  @PrimaryGeneratedColumn('increment', {
    comment: 'Primary key',
    type: 'int',
    name: 'id',
  })
  id: number;

  @Column('varchar', {
    length: 24,
    unique: true,
    comment: 'Mã tài xế',
  })
  code: string;

  @Column({
    type: 'int',
    comment: 'ID công ty',
  })
  companyId: number;

  @Column({
    type: 'int',
    comment: 'ID phương tiện mặc định (tb_verhical)',
  })
  verhicalId: number;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Tên tài xế',
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: 'Số bằng lái',
  })
  license: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: 'Số điện thoại',
  })
  phone: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: 'Email',
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: 'Trạng thái tài xế',
  })
  status: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Mô tả',
  })
  description: string;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
    comment: 'Đánh giá trung bình',
  })
  rate: number;

  @Column({
    type: 'int',
    default: 0,
    comment: 'Tổng số chuyến đã chạy',
  })
  totalTurn: number;

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
