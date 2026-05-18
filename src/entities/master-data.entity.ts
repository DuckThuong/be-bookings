import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tb_master_data')
export class TbMasterData {
  @PrimaryGeneratedColumn('increment', {
    comment: 'Primary key',
    type: 'int',
    name: 'id',
  })
  id: number;

  @Column({
    type: 'varchar',
    length: 50,
    comment: 'Loại dữ liệu',
  })
  type: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: 'Mã dữ liệu',
  })
  code: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Tên hiển thị',
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Quy tắc/giá trị bổ sung',
  })
  rule: string;

  @Column({
    type: 'int',
    default: 0,
    comment: 'Thứ tự sắp xếp',
  })
  sort: number;
}
