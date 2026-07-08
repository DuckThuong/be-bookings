import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TbChatMessage } from './chat-message.entity';

@Entity('tb_chat_message_attachment')
export class TbChatMessageAttachment {
  @PrimaryGeneratedColumn('increment', { type: 'int', name: 'id' })
  id: number;

  @ManyToOne(() => TbChatMessage, (message) => message.attachments)
  @JoinColumn({ name: 'message_id' })
  message: TbChatMessage;

  @Column({ type: 'int', name: 'message_id' })
  messageId: number;

  @Column({ type: 'varchar', length: 500, name: 'file_name' })
  fileName: string;

  @Column({ type: 'varchar', length: 255, name: 'mime_type' })
  mimeType: string;

  @Column({ type: 'int', name: 'size_bytes' })
  sizeBytes: number;

  @Column({ type: 'varchar', length: 1000 })
  url: string;

  @Column({ type: 'int', nullable: true })
  width: number | null;

  @Column({ type: 'int', nullable: true })
  height: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
