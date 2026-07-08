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
import { TbBasicUser } from '../user/basic-user.entity';
import { TbChatConversationMember } from './chat-conversation-member.entity';
import { TbChatMessage } from './chat-message.entity';

export enum ChatConversationType {
  OPERATOR = 'OPERATOR',
  ADMIN = 'ADMIN',
  SUPPORT = 'SUPPORT',
  CUSTOMER = 'CUSTOMER',
}

export enum ChatConversationStatus {
  OPEN = 'OPEN',
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum ChatConversationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

@Entity('tb_chat_conversation')
export class TbChatConversation {
  @PrimaryGeneratedColumn('increment', { type: 'int', name: 'id' })
  id: number;

  @ManyToOne(() => TbBasicUser)
  @JoinColumn({ name: 'member_a_user_id' })
  memberAUser: TbBasicUser;

  @ManyToOne(() => TbBasicUser)
  @JoinColumn({ name: 'member_b_user_id' })
  memberBUser: TbBasicUser;

  @ManyToOne(() => TbBasicUser)
  @JoinColumn({ name: 'assignee_user_id' })
  assigneeUser: TbBasicUser | null;

  @OneToMany(() => TbChatConversationMember, (member) => member.conversation)
  members: TbChatConversationMember[];

  @OneToMany(() => TbChatMessage, (message) => message.conversation)
  messages: TbChatMessage[];

  @Column({ type: 'enum', enum: ChatConversationType, default: ChatConversationType.OPERATOR })
  type: ChatConversationType;

  @Column({ type: 'enum', enum: ChatConversationStatus, default: ChatConversationStatus.OPEN })
  status: ChatConversationStatus;

  @Column({ type: 'enum', enum: ChatConversationPriority, default: ChatConversationPriority.NORMAL })
  priority: ChatConversationPriority;

  @Column({ type: 'int', name: 'member_a_user_id' })
  memberAUserId: number;

  @Column({ type: 'int', name: 'member_b_user_id' })
  memberBUserId: number;

  @Column({ type: 'int', nullable: true, name: 'assignee_user_id' })
  assigneeUserId: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'related_booking_id' })
  relatedBookingId: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  title: string | null;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  lastMessagePreview: string | null;

  @Column({ type: 'datetime', nullable: true, name: 'last_message_at' })
  lastMessageAt: Date | null;

  @Column({ type: 'int', nullable: true, name: 'last_message_sender_id' })
  lastMessageSenderId: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
