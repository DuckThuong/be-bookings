import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TbChatConversation } from './chat-conversation.entity';
import { TbBasicUser } from '../user/basic-user.entity';

export enum ChatMemberRole {
  CUSTOMER = 'CUSTOMER',
  OPERATOR = 'OPERATOR',
  ADMIN = 'ADMIN',
  SUPPORT = 'SUPPORT',
}

@Entity('tb_chat_conversation_member')
export class TbChatConversationMember {
  @PrimaryGeneratedColumn('increment', { type: 'int', name: 'id' })
  id: number;

  @ManyToOne(() => TbChatConversation, (conversation) => conversation.members)
  @JoinColumn({ name: 'conversation_id' })
  conversation: TbChatConversation;

  @ManyToOne(() => TbBasicUser)
  @JoinColumn({ name: 'user_id' })
  user: TbBasicUser;

  @Column({ type: 'int', name: 'conversation_id' })
  conversationId: number;

  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  @Column({ type: 'enum', enum: ChatMemberRole, name: 'role_in_conversation' })
  roleInConversation: ChatMemberRole;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nickname: string | null;

  @Column({ type: 'boolean', default: false, name: 'is_pinned' })
  isPinned: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_muted' })
  isMuted: boolean;

  @Column({ type: 'datetime', nullable: true, name: 'muted_until' })
  mutedUntil: Date | null;

  @Column({ type: 'int', default: 0, name: 'unread_count' })
  unreadCount: number;

  @Column({ type: 'datetime', nullable: true, name: 'last_read_at' })
  lastReadAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
