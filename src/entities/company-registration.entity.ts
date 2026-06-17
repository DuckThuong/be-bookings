import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum RegistrationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('tb_company_registration')
export class TbCompanyRegistration {
  @PrimaryGeneratedColumn('increment', {
    comment: 'Primary key',
    type: 'int',
    name: 'id',
  })
  id: number;

  @Column({
    type: 'int',
    comment: 'ID user đăng ký (tb_basic_user.id)',
  })
  userId: number;

  @Column({
    type: 'varchar',
    length: 24,
    comment: 'Mã người dùng (tb_basic_user.userCode)',
  })
  userCode: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: 'Tên người dùng đăng ký',
  })
  userName: string;

  @Column({
    type: 'varchar',
    length: 20,
    comment: 'Số điện thoại đăng ký',
  })
  userPhone: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: 'Email đăng ký',
  })
  userEmail: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Tên nhà xe đăng ký',
  })
  companyName: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'Địa chỉ trụ sở nhà xe',
  })
  address: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: 'Số điện thoại đại diện nhà xe',
  })
  representativePhone: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Tên người đại diện pháp lý',
  })
  representativeName: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Chức vụ người đại diện',
  })
  representativePosition: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'Mã số thuế',
  })
  taxCode: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Địa chỉ trụ sở theo giấy phép kinh doanh',
  })
  businessAddress: string;

  @Column({
    type: 'date',
    nullable: true,
    comment: 'Ngày cấp giấy phép kinh doanh',
  })
  businessLicenseDate: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'URL giấy phép kinh doanh',
  })
  businessLicenseUrl: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'URL CMND/CCCD đại diện pháp lý',
  })
  idCardUrl: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Mô tả thêm',
  })
  description: string;

  @Column({
    type: 'enum',
    enum: RegistrationStatus,
    default: RegistrationStatus.PENDING,
    comment: 'Trạng thái đăng ký',
  })
  status: RegistrationStatus;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Lý do từ chối (khi admin reject)',
  })
  rejectionReason: string | null;

  @Column({
    type: 'int',
    nullable: true,
    comment: 'ID admin xử lý yêu cầu',
  })
  processedByAdminId: number | null;

  @Column({
    type: 'datetime',
    nullable: true,
    comment: 'Thời gian admin xử lý',
  })
  processedAt: Date | null;

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
