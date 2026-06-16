import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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
@Index('idx_chat_conv_member_a', ['memberAUserId'])
@Index('idx_chat_conv_member_b', ['memberBUserId'])
@Index('idx_chat_conv_status', ['status'])
export class TbChatConversation {
  @PrimaryGeneratedColumn('increment', {
    comment: 'Primary key',
    type: 'int',
    name: 'id',
  })
  id: number;

  @Column({
    type: 'enum',
    enum: ChatConversationType,
    default: ChatConversationType.OPERATOR,
    comment: 'Loại cuộc trò chuyện',
  })
  type: ChatConversationType;

  @Column({
    type: 'enum',
    enum: ChatConversationStatus,
    default: ChatConversationStatus.OPEN,
    comment: 'Trạng thái xử lý',
  })
  status: ChatConversationStatus;

  @Column({
    type: 'enum',
    enum: ChatConversationPriority,
    default: ChatConversationPriority.NORMAL,
    comment: 'Mức độ ưu tiên',
  })
  priority: ChatConversationPriority;

  @Column({
    type: 'int',
    name: 'member_a_user_id',
    comment: 'User id phía khách hàng',
  })
  memberAUserId: number;

  @Column({
    type: 'int',
    name: 'member_b_user_id',
    comment: 'User id phía đối tác (nhà xe/admin/operator)',
  })
  memberBUserId: number;

  @Column({
    type: 'int',
    nullable: true,
    name: 'assignee_user_id',
    comment: 'User id của CMS staff được phân công',
  })
  assigneeUserId: number | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'related_booking_id',
    comment: 'Mã booking liên quan (nếu có)',
  })
  relatedBookingId: string | null;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'Tiêu đề/tên cuộc trò chuyện',
  })
  title: string | null;

  @Column({
    type: 'varchar',
    length: 1000,
    nullable: true,
    comment: 'Xem trước tin nhắn cuối',
  })
  lastMessagePreview: string | null;

  @Column({
    type: 'datetime',
    nullable: true,
    name: 'last_message_at',
    comment: 'Thời điểm tin nhắn cuối',
  })
  lastMessageAt: Date | null;

  @Column({
    type: 'int',
    name: 'last_message_sender_id',
    nullable: true,
    comment: 'User id gửi tin nhắn cuối',
  })
  lastMessageSenderId: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
