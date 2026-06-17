import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/jwt/jwt.guard';
import { UserDecoratorDtoResponse, UserRole } from '../dtos/user/common.dto';
import { User } from '../user.decorator';
import { ChatService } from '../services/chat.service';
import {
  ChatAssignConversationDto,
  ChatCreateConversationDto,
  ChatGetMessagesQueryDto,
  ChatListConversationsQueryDto,
  ChatMarkReadDto,
  ChatMuteConversationDto,
  ChatPinConversationDto,
  ChatSendMessageDto,
  ChatSetNicknameDto,
  ChatUpdateStatusDto,
} from '../dtos/chat-request.dto';
import {
  ChatConversationResponseDto,
  ChatPaginatedMessagesDto,
  ChatMessageResponseDto,
} from '../dtos/chat.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // ─── Conversations ───────────────────────────────────────────────
  @Get('conversations')
  @ApiOperation({ summary: 'Danh sách cuộc trò chuyện của user hiện tại' })
  listConversations(
    @User() user: UserDecoratorDtoResponse,
    @Query() query: ChatListConversationsQueryDto,
  ): Promise<ChatConversationResponseDto[]> {
    return this.chatService.listConversations(user, query);
  }

  @Get('operators')
  @ApiOperation({ summary: 'Danh sách nhà xe/admin có thể bắt đầu chat' })
  async listOperatorHotlines(): Promise<ChatConversationResponseDto[]> {
    return this.chatService.listOperatorHotlines();
  }

  @Post('conversations')
  @ApiOperation({ summary: 'Tạo cuộc trò chuyện mới' })
  createConversation(
    @User() user: UserDecoratorDtoResponse,
    @Body() payload: ChatCreateConversationDto,
  ): Promise<ChatConversationResponseDto> {
    return this.chatService.createConversation(user, payload);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Chi tiết 1 cuộc trò chuyện' })
  getConversationDetail(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ChatConversationResponseDto | null> {
    return this.chatService.getConversationDetail(user, id);
  }

  // ─── Messages ─────────────────────────────────────────────────────
  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Lấy danh sách tin nhắn trong 1 cuộc trò chuyện' })
  listMessages(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
    @Query() query: ChatGetMessagesQueryDto,
  ): Promise<ChatPaginatedMessagesDto> {
    return this.chatService.listMessages(user, id, query);
  }

  @Post('messages')
  @ApiOperation({ summary: 'Gửi tin nhắn mới' })
  sendMessage(
    @User() user: UserDecoratorDtoResponse,
    @Body() payload: ChatSendMessageDto,
  ): Promise<ChatMessageResponseDto> {
    return this.chatService.sendMessage(user, payload);
  }

  @Post('conversations/:id/read')
  @ApiOperation({ summary: 'Đánh dấu đã đọc' })
  async markRead(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: ChatMarkReadDto,
  ): Promise<{ success: true }> {
    await this.chatService.markRead(user, id, payload);
    return { success: true };
  }

  // ─── Per-user actions (nickname / pin / mute) ─────────────────────
  @Patch('conversations/:id/nickname')
  setNickname(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: ChatSetNicknameDto,
  ): Promise<{ success: true }> {
    return this.chatService
      .setNickname(user, id, payload)
      .then(() => ({ success: true }));
  }

  @Patch('conversations/:id/pin')
  pinConversation(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: ChatPinConversationDto,
  ): Promise<{ success: true }> {
    return this.chatService
      .pinConversation(user, id, payload)
      .then(() => ({ success: true }));
  }

  @Patch('conversations/:id/mute')
  muteConversation(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: ChatMuteConversationDto,
  ): Promise<{ success: true }> {
    return this.chatService
      .muteConversation(user, id, payload)
      .then(() => ({ success: true }));
  }

  // ─── CMS-only actions (chỉ ADMIN) ───────────────────────────────
  @Patch('conversations/:id/assign')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  assignConversation(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: ChatAssignConversationDto,
  ): Promise<{ success: true }> {
    return this.chatService
      .assignConversation(user, id, payload)
      .then(() => ({ success: true }));
  }

  @Patch('conversations/:id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  updateStatus(
    @User() user: UserDecoratorDtoResponse,
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: ChatUpdateStatusDto,
  ): Promise<{ success: true }> {
    return this.chatService
      .updateStatus(user, id, payload)
      .then(() => ({ success: true }));
  }
}
