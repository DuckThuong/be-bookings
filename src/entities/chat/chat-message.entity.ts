import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ChatMessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  SYSTEM = 'SYSTEM',
}

export enum ChatMessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
}

@Entity('tb_chat_message')
@Index('idx_chat_msg_conversation', ['conversationId', 'createdAt'])
@Index('idx_chat_msg_sender', ['senderId'])
export class TbChatMessage {
  @PrimaryGeneratedColumn('increment', {
    comment: 'Primary key',
    type: 'int',
    name: 'id',
  })
  id: number;

  @Column({
    type: 'int',
    name: 'conversation_id',
    comment: 'FK tb_chat_conversation.id',
  })
  conversationId: number;

  @Column({
    type: 'int',
    name: 'sender_id',
    comment: 'User id gửi tin nhắn',
  })
  senderId: number;

  @Column({
    type: 'enum',
    enum: ChatMessageType,
    default: ChatMessageType.TEXT,
    comment: 'Loại tin nhắn',
  })
  type: ChatMessageType;

  @Column({
    type: 'enum',
    enum: ChatMessageStatus,
    default: ChatMessageStatus.SENT,
    comment: 'Trạng thái gửi',
  })
  status: ChatMessageStatus;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Nội dung tin nhắn',
  })
  content: string | null;

  @Column({
    type: 'json',
    nullable: true,
    name: 'metadata',
    comment: 'Metadata tuỳ chỉnh (vd: clientMessageId, edit history)',
  })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
