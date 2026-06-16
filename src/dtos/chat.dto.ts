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

export type ChatMutePreset =
  | '15m'
  | '1h'
  | '8h'
  | '24h'
  | 'no end time yet';

export interface ChatAttachmentDto {
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
  width?: number;
  height?: number;
}

export class ChatMessageResponseDto {
  id: number;
  conversationId: number;
  senderId: number;
  senderName?: string;
  senderAvatarUrl?: string;
  content?: string | null;
  type: ChatMessageType;
  status: ChatMessageStatus;
  attachments: ChatAttachmentDto[];
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;

  static from(row: {
    id: number;
    conversationId: number;
    senderId: number;
    type: ChatMessageType;
    status: ChatMessageStatus;
    content: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
    senderName?: string;
    senderAvatarUrl?: string;
    attachments?: ChatAttachmentDto[];
  }): ChatMessageResponseDto {
    return {
      id: row.id,
      conversationId: row.conversationId,
      senderId: row.senderId,
      senderName: row.senderName,
      senderAvatarUrl: row.senderAvatarUrl,
      content: row.content,
      type: row.type,
      status: row.status,
      attachments: row.attachments ?? [],
      metadata: row.metadata,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}

export class ChatParticipantDto {
  userId: number;
  fullName?: string;
  nickname?: string | null;
  isPinned: boolean;
  isMuted: boolean;
  mutedUntil?: string | null;
  unreadCount: number;
  isAssigned?: boolean;
}

export class ChatToUserDto {
  userId: number;
  fullName: string;
  username: string;
  avatarUrl: string;
  email: string;
  phone?: string;
  role: 'OPERATOR' | 'ADMIN' | 'SUPPORT' | 'USER' | 'CUSTOMER';
}

export class ChatConversationResponseDto {
  conversationId: number;
  conversationName?: string | null;
  conversationAvatar?: string | null;
  conversationCreatedAt: string;
  lastMessagePreview?: string | null;
  lastMessageAt?: string | null;
  unreadCount: number;
  type: ChatConversationType;
  toUser?: ChatToUserDto | null;
  participants: ChatParticipantDto[];
  status: ChatConversationStatus;
  priority: ChatConversationPriority;
  assignedTo?: string | null;
  relatedBookingId?: string | null;
}

export class ChatPaginatedMessagesDto {
  data: ChatMessageResponseDto[];
  total: number;
  page: number;
  limit: number;
}
