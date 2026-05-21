import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { TbCompany } from "./company/company.entity";
import { TbRoute } from "./route.entity";
import { TbVehicle } from "./vehicle.entity";
import { TbDriver } from "./driver.entity";

@Entity('tb_trip')
export class TbTrip extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Tên chuyến',
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: 'Trạng thái chuyến',
  })
  status: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Mô tả chuyến',
  })
  description: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 9,
    comment: 'Giá vé',
  })
  seatPrice: number;

  @Column({
    type: 'int',
    comment: 'Tổng số ghế',
  })
  totalSeatNumber: number;

  @Column({
    type: 'int',
    comment: 'Số ghế đã bán',
  })
  paidseatNumber: number;

  @Column({
    type: 'int',
    comment: 'Số ghế trống',
  })
  emptySeatNumber: number;

  @Column({
    type: 'int',
    comment: 'ID tuyến đường (tb_road)',
  })
  routeId: number;

  @Column({
    type: 'int',
    comment: 'ID phương tiện (tb_vehicle)',
  })
  vehicleId: number;

  @Column({
    type: 'int',
    comment: 'ID tài xế (tb_driver)',
  })
  driverId: number;

  @Column({
    type: 'int',
    comment: 'ID công ty (tb_company)',
  })
  companyId: number;

  @ManyToOne(()=> TbCompany, (company) => company.companyTrips)
  company: TbCompany;

  @ManyToOne(() => TbRoute, (route) => route.trips)
  route: TbRoute;

  @ManyToOne(() => TbVehicle, (vehicle) => vehicle.trips)
  vehicle: TbVehicle;

  @ManyToOne(() => TbDriver, (driver) => driver.trips)
  driver: TbDriver;
}
