import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TbChatMessage } from './chat-message.entity';
import { TbChatConversation } from './chat-conversation.entity';
import { TbBasicUser } from '../user/basic-user.entity';

@Entity('tb_chat_message_recipient')
export class TbChatMessageRecipient {
  @PrimaryGeneratedColumn('increment', { type: 'int', name: 'id' })
  id: number;

  @ManyToOne(() => TbChatMessage, (message) => message.recipients)
  message: TbChatMessage;

  @ManyToOne(() => TbChatConversation)
  conversation: TbChatConversation;

  @ManyToOne(() => TbBasicUser)
  user: TbBasicUser;

  @Column({ type: 'int', name: 'message_id' })
  messageId: number;

  @Column({ type: 'int', name: 'conversation_id' })
  conversationId: number;

  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  @Column({ type: 'datetime', nullable: true, name: 'delivered_at' })
  deliveredAt: Date | null;

  @Column({ type: 'datetime', nullable: true, name: 'read_at' })
  readAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
