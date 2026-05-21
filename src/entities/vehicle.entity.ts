import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { TbCompany } from "./company/company.entity";
import { TbTrip } from "./trip.entity";

@Entity('tb_vehicle')
export class TbVehicle extends BaseEntity {
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
    comment: 'Loại phương tiện, ví dụ: xe khách, xe tải, v.v.',
  })
  type: string;

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
  description?: string;

  @Column({
    type: 'int',
    comment: 'Số chỗ ngồi của phương tiện',
  })
  seatNumber: number;

  @Column({
    type: 'varchar',
    length: 50,
    comment: 'Loại ghế ngồi',
  })
  seatType: string;

  @Column({
    type: 'int',
    comment: 'ID công ty',
  })
  companyId: number;
 
  @ManyToOne(() => TbCompany, (company) => company.companyVehicles)
  company: TbCompany;

  @OneToMany(() => TbTrip, (trip) => trip.vehicle)
  trips: TbTrip[];
}
