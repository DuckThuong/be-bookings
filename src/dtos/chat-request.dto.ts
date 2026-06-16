import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  ChatConversationPriority,
  ChatConversationStatus,
  ChatConversationType,
  ChatMessageType,
  ChatMutePreset,
} from './chat.dto';

const MUTE_PRESETS: ChatMutePreset[] = [
  '15m',
  '1h',
  '8h',
  '24h',
  'no end time yet',
];

export class ChatAttachmentRequestDto {
  @IsString()
  fileName: string;

  @IsString()
  mimeType: string;

  @IsInt()
  @Min(0)
  size: number;

  @IsString()
  url: string;

  @IsOptional()
  @IsInt()
  width?: number;

  @IsOptional()
  @IsInt()
  height?: number;
}

export class ChatSendMessageDto {
  @IsInt()
  conversationId: number;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatAttachmentRequestDto)
  attachments?: ChatAttachmentRequestDto[];

  @IsOptional()
  @IsEnum(ChatMessageType)
  type?: ChatMessageType;
}

export class ChatCreateConversationDto {
  @IsInt()
  toUserId: number;

  @IsEnum(ChatConversationType)
  type: ChatConversationType;

  @IsOptional()
  @IsString()
  initialMessage?: string;

  @IsOptional()
  @IsEnum(ChatConversationPriority)
  priority?: ChatConversationPriority;

  @IsOptional()
  @IsString()
  relatedBookingId?: string;
}

export class ChatGetMessagesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 50;
}

export class ChatListConversationsQueryDto {
  @IsOptional()
  @IsString()
  filter?: string;
}

export class ChatSetNicknameDto {
  @IsOptional()
  @IsString()
  nickname?: string | null;
}

export class ChatPinConversationDto {
  @IsOptional()
  isPinned?: boolean;
}

export class ChatMuteConversationDto {
  @IsIn(MUTE_PRESETS)
  preset: ChatMutePreset;
}

export class ChatAssignConversationDto {
  @IsOptional()
  @IsInt()
  assigneeId?: number | null;
}

export class ChatUpdateStatusDto {
  @IsEnum(ChatConversationStatus)
  status: ChatConversationStatus;

  @IsOptional()
  @IsEnum(ChatConversationPriority)
  priority?: ChatConversationPriority;
}

export class ChatMarkReadDto {
  @IsOptional()
  @IsInt()
  lastMessageId?: number;
}
