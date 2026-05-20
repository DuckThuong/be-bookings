import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tb_company')
export class TbCompany {
  @PrimaryGeneratedColumn('increment', {
    comment: 'Primary key',
    type: 'int',
    name: 'id',
  })
  id: number;

  @Column({
    type: 'varchar',
    length: 24,
    comment: 'Mã người đại diện (userCode)',
  })
  userLeadId: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Tên công ty',
  })
  companyName: string;

  @Column('varchar', {
    length: 24,
    unique: true,
    comment: 'Mã công ty',
  })
  code: string;

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
