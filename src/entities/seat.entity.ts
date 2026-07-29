import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TbVehicle } from './vehicle.entity';

@Entity('tb_seat')
export class TbSeat {
  @PrimaryGeneratedColumn('increment', { type: 'int', name: 'id' })
  id: number;

  @ManyToOne(() => TbVehicle, (vehicle) => vehicle.seats)
  vehicle: TbVehicle;

  @Column({ name: 'vehicle_id', type: 'int' })
  vehicleId: number;

  @Column('varchar', { length: 24, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ name: 'seat_index', type: 'varchar', length: 20 })
  index: string;

  @Column({ type: 'varchar', length: 50 })
  status: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
