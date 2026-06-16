import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ChatMemberRole {
  CUSTOMER = 'CUSTOMER',
  OPERATOR = 'OPERATOR',
  ADMIN = 'ADMIN',
  SUPPORT = 'SUPPORT',
}

@Entity('tb_chat_conversation_member')
@Index('uk_chat_member_unique', ['conversationId', 'userId'], { unique: true })
@Index('idx_chat_member_user', ['userId'])
export class TbChatConversationMember {
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
    name: 'user_id',
    comment: 'User id tham gia cuộc trò chuyện',
  })
  userId: number;

  @Column({
    type: 'enum',
    enum: ChatMemberRole,
    name: 'role_in_conversation',
    comment: 'Vai trò trong cuộc trò chuyện',
  })
  roleInConversation: ChatMemberRole;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'nickname',
    comment: 'Biệt danh do phía đối diện đặt',
  })
  nickname: string | null;

  @Column({
    type: 'boolean',
    default: false,
    name: 'is_pinned',
    comment: 'Ghim cuộc trò chuyện',
  })
  isPinned: boolean;

  @Column({
    type: 'boolean',
    default: false,
    name: 'is_muted',
    comment: 'Tắt thông báo',
  })
  isMuted: boolean;

  @Column({
    type: 'datetime',
    nullable: true,
    name: 'muted_until',
    comment: 'Mute tới thời điểm (null = tắt vĩnh viễn)',
  })
  mutedUntil: Date | null;

  @Column({
    type: 'int',
    default: 0,
    name: 'unread_count',
    comment: 'Số tin nhắn chưa đọc của user này',
  })
  unreadCount: number;

  @Column({
    type: 'datetime',
    nullable: true,
    name: 'last_read_at',
    comment: 'Lần cuối user này đọc cuộc trò chuyện',
  })
  lastReadAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
