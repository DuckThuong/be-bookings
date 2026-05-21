import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BaseEntity } from '../base.entity';
import { TbTrip } from "../trip.entity";
import { TbDriver } from "../driver.entity";
import { TbVehicle } from "../vehicle.entity";
import { TbRoute } from "../route.entity";

@Entity('tb_company')
export class TbCompany extends BaseEntity {

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Tên công ty',
  })
  companyName: string;


  @Column({
    type: 'text',
    nullable: true,
    comment: 'Mô tả công ty',
  })
  description: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: 'Trạng thái công ty',
  })
  status: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: "Email công ty",
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 20,
    comment: "Số điện thoại công ty",
  })
  phone: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: "Họ tên người đại diện",
  })
  representative: string;

  @OneToMany(() => TbTrip, (companyTrip) => companyTrip.company)
  companyTrips: TbTrip[];

  @OneToMany(()=> TbDriver, (companyDriver) => companyDriver.company)
  companyDrivers: TbDriver[];

  @OneToMany(()=> TbVehicle, (companyVehicle) => companyVehicle.company)
  companyVehicles: TbVehicle[];

  @OneToMany(() => TbRoute, (companyRoute) => companyRoute.company)
  companyRoutes: TbRoute[];
}
