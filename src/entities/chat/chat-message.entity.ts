import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TbChatConversation } from './chat-conversation.entity';
import { TbBasicUser } from '../user/basic-user.entity';
import { TbChatMessageRecipient } from './chat-message-recipient.entity';
import { TbChatMessageAttachment } from './chat-message-attachment.entity';

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
export class TbChatMessage {
  @PrimaryGeneratedColumn('increment', { type: 'int', name: 'id' })
  id: number;

  @ManyToOne(() => TbChatConversation, (conversation) => conversation.messages)
  @JoinColumn({ name: 'conversation_id' })
  conversation: TbChatConversation;

  @ManyToOne(() => TbBasicUser)
  @JoinColumn({ name: 'sender_id' })
  sender: TbBasicUser;

  @OneToMany(() => TbChatMessageRecipient, (recipient) => recipient.message)
  recipients: TbChatMessageRecipient[];

  @OneToMany(() => TbChatMessageAttachment, (attachment) => attachment.message)
  attachments: TbChatMessageAttachment[];

  @Column({ type: 'int', name: 'conversation_id' })
  conversationId: number;

  @Column({ type: 'int', name: 'sender_id' })
  senderId: number;

  @Column({ type: 'enum', enum: ChatMessageType, default: ChatMessageType.TEXT })
  type: ChatMessageType;

  @Column({ type: 'enum', enum: ChatMessageStatus, default: ChatMessageStatus.SENT })
  status: ChatMessageStatus;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @Column({ type: 'json', nullable: true, name: 'metadata' })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
