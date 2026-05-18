import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tb_info_user')
export class TbInfoUser {
  @PrimaryGeneratedColumn('increment', {
    comment: 'Primary key',
    type: 'int',
    name: 'id',
  })
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Ảnh',
  })
  avatar: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: 'Tên người dùng',
  })
  userName: string;

  @Column({
    type: 'date',
    comment: 'Ngày sinh',
  })
  userDob: string;

  @Column({
    type: 'int',
    comment: 'Giới tính',
  })
  userGender: number;
}
