import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tb_road')
export class TbRoad {
  @PrimaryGeneratedColumn('increment', {
    comment: 'Primary key',
    type: 'int',
    name: 'id',
  })
  id: number;

  @Column({
    type: 'int',
    comment: 'ID công ty (tb_company)',
  })
  companyId: number;

  @Column('varchar', {
    length: 24,
    unique: true,
    comment: 'Mã tuyến đường',
  })
  code: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Tên tuyến đường',
  })
  name: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
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
    type: 'int',
    default: 0,
    comment: 'Tổng số chuyến',
  })
  totalTurn: number;

  @Column({
    type: 'varchar',
    length: 50,
    default: '',
    comment: 'Thời gian di chuyển chuẩn (vd: 6h30m)',
  })
  standardDuration: string;

  @Column({
    type: 'int',
    default: 0,
    comment: 'Số chuyến mỗi ngày (kế hoạch)',
  })
  tripsPerDay: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    comment: 'Tỉ lệ lấp đầy trung bình (%)',
  })
  averageOccupancy: number;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: 'Doanh thu ước tính',
  })
  estimatedRevenue: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Xe chủ lực (tên hoặc mã hiển thị)',
  })
  leadVehicle: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'Mức nhu cầu',
  })
  demandLevel: string | null;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'Ghi chú',
  })
  note: string | null;
}
