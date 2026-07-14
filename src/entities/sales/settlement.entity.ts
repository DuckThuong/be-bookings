import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TbCompany } from '../company/company.entity';

@Entity('tb_settlement')
export class TbSettlement {
  @PrimaryGeneratedColumn('increment', { type: 'int', name: 'id' })
  id: number;

  @ManyToOne(() => TbCompany, (company) => company.settlements)
  @JoinColumn({ name: 'company_id' })
  company: TbCompany;

  @Column('varchar', { length: 24, unique: true })
  code: string;

  @Column({ type: 'int' })
  companyId: number;

  @Column({ type: 'date' })
  periodFrom: string;

  @Column({ type: 'date' })
  periodTo: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalSales: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalCommission: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  payoutAmount: number;

  @Column({ type: 'varchar', length: 50 })
  status: string;

  @Column({ type: 'datetime', nullable: true })
  paidAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
