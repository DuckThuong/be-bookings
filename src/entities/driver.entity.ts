import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { BaseEntity } from './base.entity';
import { TbCompany } from "./company/company.entity";
import { TbTrip } from "./trip.entity";

@Entity('tb_driver')
export class TbDriver extends BaseEntity {
  @Column('varchar', {
    length: 24,
    unique: true,
    comment: 'Mã tài xế',
  })
  code: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Tên tài xế',
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 10,
    comment: 'Loại bằng lái',
  })
  license: string;

  @Column({
    type: 'varchar',
    length: 32,
    comment: 'Số bằng lái',
  })
  licenseNumber: string;

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
  description?: string;

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

  @Column({
    type: 'int',
    comment: 'ID công ty',
  })
  companyId: number;

  @ManyToOne(() => TbCompany, (company) => company.companyDrivers)
  company: TbCompany;

  @OneToMany(() => TbTrip, (trip) => trip.driver)
  trips: TbTrip[];
}


