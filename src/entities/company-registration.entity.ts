import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TbBasicUser } from './user/basic-user.entity';

export enum RegistrationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('tb_company_registration')
export class TbCompanyRegistration {
  @PrimaryGeneratedColumn('increment', { type: 'int', name: 'id' })
  id: number;

  @ManyToOne(() => TbBasicUser)
  @JoinColumn({ name: 'user_id' })
  user: TbBasicUser;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'varchar', length: 24 })
  userCode: string;

  @Column({ type: 'varchar', length: 100 })
  userName: string;

  @Column({ type: 'varchar', length: 20 })
  userPhone: string;

  @Column({ type: 'varchar', length: 100 })
  userEmail: string;

  @Column({ type: 'varchar', length: 255 })
  companyName: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  representativePhone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  representativeName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  representativePosition: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  taxCode: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  businessAddress: string;

  @Column({ type: 'date', nullable: true })
  businessLicenseDate: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  businessLicenseUrl: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  idCardUrl: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: RegistrationStatus, default: RegistrationStatus.PENDING })
  status: RegistrationStatus;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;

  @Column({ type: 'int', nullable: true })
  processedByAdminId: number | null;

  @Column({ type: 'datetime', nullable: true })
  processedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
