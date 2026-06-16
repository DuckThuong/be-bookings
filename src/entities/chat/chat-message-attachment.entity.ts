import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('tb_chat_message_attachment')
@Index('idx_chat_attach_msg', ['messageId'])
export class TbChatMessageAttachment {
  @PrimaryGeneratedColumn('increment', {
    comment: 'Primary key',
    type: 'int',
    name: 'id',
  })
  id: number;

  @Column({
    type: 'int',
    name: 'message_id',
    comment: 'FK tb_chat_message.id',
  })
  messageId: number;

  @Column({
    type: 'varchar',
    length: 500,
    name: 'file_name',
    comment: 'Tên file gốc',
  })
  fileName: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'mime_type',
    comment: 'MIME type',
  })
  mimeType: string;

  @Column({
    type: 'int',
    name: 'size_bytes',
    comment: 'Kích thước file (bytes)',
  })
  sizeBytes: number;

  @Column({
    type: 'varchar',
    length: 1000,
    comment: 'URL truy cập file',
  })
  url: string;

  @Column({
    type: 'int',
    nullable: true,
    comment: 'Chiều rộng ảnh (nếu là ảnh)',
  })
  width: number | null;

  @Column({
    type: 'int',
    nullable: true,
    comment: 'Chiều cao ảnh (nếu là ảnh)',
  })
  height: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
