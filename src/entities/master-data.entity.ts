import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tb_master_data')
export class TbMasterData {
  @PrimaryGeneratedColumn('increment', { type: 'int', name: 'id' })
  id: number;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  rule: string;

  @Column({ type: 'int', default: 0 })
  sort: number;
}
