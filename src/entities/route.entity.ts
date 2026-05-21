import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { TbCompany } from './company/company.entity';
import { TbTrip } from './trip.entity';

@Entity('tb_route')
export class TbRoute extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Tên tuyến đường',
  })
  name: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 4,
    comment: 'Chiều dài tuyến (km)',
  })
  length: number;

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
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Mô tả tuyến đường',
  })
  description?: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Điểm đón khách',
  })
  pickUpPoint: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Điểm trả khách',
  })
  dropPoint: string;

  @Column({
    type: 'int',
    comment: 'Số lượng tuyến',
  })
  routeNumber: number;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Đơn vị thời gian(phút, giờ)',
  })
  unit: string;

  @Column({
    type: 'int',
    comment: 'ID công ty',
  })
  companyId: number;

  @ManyToOne(() => TbCompany, (company) => company.companyRoutes)
  company: TbCompany;

  @OneToMany(() => TbTrip, (trip) => trip.route)
  trips: TbTrip[];
}
