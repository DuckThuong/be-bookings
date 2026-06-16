import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('tb_chat_message_recipient')
@Index('uk_chat_recipient_unique', ['messageId', 'userId'], { unique: true })
@Index('idx_chat_recipient_user_unread', ['userId', 'readAt'])
export class TbChatMessageRecipient {
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
    type: 'int',
    name: 'conversation_id',
    comment: 'FK tb_chat_conversation.id (denormalized để query nhanh)',
  })
  conversationId: number;

  @Column({
    type: 'int',
    name: 'user_id',
    comment: 'User id nhận tin nhắn',
  })
  userId: number;

  @Column({
    type: 'datetime',
    nullable: true,
    name: 'delivered_at',
    comment: 'Thời điểm client nhận',
  })
  deliveredAt: Date | null;

  @Column({
    type: 'datetime',
    nullable: true,
    name: 'read_at',
    comment: 'Thời điểm user đọc',
  })
  readAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
