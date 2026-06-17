import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ChatRepository } from '../repositories/chat.repository';
import { UserDecoratorDtoResponse } from '../dtos/user/common.dto';
import {
  ChatAttachmentDto,
  ChatConversationResponseDto,
  ChatMessageResponseDto,
  ChatPaginatedMessagesDto,
  ChatParticipantDto,
  ChatToUserDto,
} from '../dtos/chat.dto';
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
  ChatConversationPriority,
  ChatConversationStatus,
  ChatConversationType,
  ChatMemberRole,
  ChatMessageStatus,
  ChatMessageType,
  TbChatConversation,
  TbChatConversationMember,
  TbChatMessage,
} from '../entities/chat';
import { UserRole } from '../dtos/user/common.dto';
import { ChatGateway } from '../socket/chat.gateway';

const MUTE_PRESET_TO_MS: Record<string, number | null> = {
  '15m': 15 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '8h': 8 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  'no end time yet': null,
};

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly repo: ChatRepository,
    private readonly gateway: ChatGateway,
  ) {}

  // ─── Conversations list ─────────────────────────────────────────────
  public async listConversations(
    user: UserDecoratorDtoResponse,
    _query: ChatListConversationsQueryDto,
  ): Promise<ChatConversationResponseDto[]> {
    const isStaff = this.isStaff(user);
    const conversations = isStaff
      ? await this.repo.listAllConversations()
      : await this.repo.listConversationsForUser(user.id);
    this.logger.debug(
      `[listConversations] userId=${user.id} role=${user.role} isStaff=${isStaff} → returned ${conversations.length} convs: ${JSON.stringify(conversations.map((c) => ({ id: c.id, memberA: c.memberAUserId, memberB: c.memberBUserId })))}`,
    );
    return this.mapConversations(conversations, user.id);
  }

  public async getConversationDetail(
    user: UserDecoratorDtoResponse,
    conversationId: number,
  ): Promise<ChatConversationResponseDto | null> {
    const conv = await this.repo.findConversationById(conversationId);
    if (!conv) return null;
    await this.assertCanReadConversation(conv, user);
    const mapped = await this.mapConversations([conv], user.id);
    return mapped[0] ?? null;
  }

  // ─── Messages ──────────────────────────────────────────────────────
  public async listMessages(
    user: UserDecoratorDtoResponse,
    conversationId: number,
    query: ChatGetMessagesQueryDto,
  ): Promise<ChatPaginatedMessagesDto> {
    const conv = await this.repo.findConversationById(conversationId);
    if (!conv) throw new NotFoundException('Cuộc trò chuyện không tồn tại');
    await this.assertCanReadConversation(conv, user);
    this.logger.debug(
      `[listMessages] userId=${user.id} conversationId=${conversationId} convMemberA=${conv.memberAUserId} convMemberB=${conv.memberBUserId}`,
    );

    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const [rows, total] = await this.repo.listMessages(
      conversationId,
      page,
      limit,
    );
    this.logger.debug(`[listMessages] → returned ${rows.length} messages, total=${total}`);
    const messages = await this.mapMessages(rows, user.id);
    return {
      data: messages,
      total,
      page,
      limit,
    };
  }

  public async sendMessage(
    user: UserDecoratorDtoResponse,
    payload: ChatSendMessageDto,
  ): Promise<ChatMessageResponseDto> {
    const conv = await this.repo.findConversationById(payload.conversationId);
    if (!conv) throw new NotFoundException('Cuộc trò chuyện không tồn tại');
    await this.assertCanWriteConversation(conv, user);

    const type = payload.type ?? ChatMessageType.TEXT;
    const created = await this.repo.createMessage({
      conversationId: conv.id,
      senderId: user.id,
      type,
      status: ChatMessageStatus.SENT,
      content: payload.content ?? null,
      metadata: null,
    });

    if (payload.attachments?.length) {
      await this.repo.createAttachments(
        payload.attachments.map((a) => ({
          messageId: created.id,
          fileName: a.fileName,
          mimeType: a.mimeType,
          sizeBytes: a.size,
          url: a.url,
          width: a.width ?? null,
          height: a.height ?? null,
        })),
      );
    }

    // Cập nhật lastMessage trên conversation + unread cho members còn lại
    const preview = payload.content ?? (payload.attachments?.length ? '(đính kèm)' : '');
    await this.repo.updateConversation(conv.id, {
      lastMessagePreview: preview,
      lastMessageAt: created.createdAt,
      lastMessageSenderId: user.id,
    });
    await this.repo.incrementUnread(conv.id, user.id);

    // Insert read-receipt cho tất cả member (trừ sender)
    const members = await this.repo.findMembers(conv.id);
    await this.repo.insertRecipients(
      members
        .filter((m) => m.userId !== user.id)
        .map((m) => ({
          messageId: created.id,
          conversationId: conv.id,
          userId: m.userId,
          deliveredAt: null,
          readAt: null,
        })),
    );

    const dto = await this.mapMessages([created], user.id);
    const message = dto[0];

    // Broadcast socket event
    this.gateway.emitMessageNew(conv.id, message);
    return message;
  }

  public async markRead(
    user: UserDecoratorDtoResponse,
    conversationId: number,
    payload: ChatMarkReadDto,
  ): Promise<void> {
    const conv = await this.repo.findConversationById(conversationId);
    if (!conv) return;
    await this.assertCanReadConversation(conv, user);

    const [rows] = await this.repo.listMessages(conversationId, 1, 1);
    const lastMessageId = payload.lastMessageId ?? rows[0]?.id;
    if (!lastMessageId) return;

    await this.repo.markRecipientsRead(conv.id, user.id, lastMessageId);
    await this.repo.resetUnread(conv.id, user.id);
    this.gateway.emitMessageRead(conv.id, {
      conversationId: conv.id,
      userId: user.id,
      lastMessageId,
    });
  }

  // ─── Create / Actions ──────────────────────────────────────────────
  public async createConversation(
    user: UserDecoratorDtoResponse,
    payload: ChatCreateConversationDto,
  ): Promise<ChatConversationResponseDto> {
    if (payload.toUserId === user.id) {
      throw new BadRequestException('Không thể tạo cuộc trò chuyện với chính mình');
    }

    let targetId = payload.toUserId;
    let targetSummary = (await this.repo.getUserSummaries([targetId]))[0];

    // Nếu target không tồn tại (hoặc FE không gửi) → fallback lookup 1 staff
    // (ADMIN, fallback OWNER) làm target. Nghiệp vụ CMS hotline: customer/operator
    // luôn nhắn tới admin.
    if (!targetSummary) {
      const fallback = await this.repo.findAnyStaffUser();
      if (!fallback) {
        throw new NotFoundException(
          'Người dùng đích không tồn tại và chưa có admin/owner nào trong hệ thống',
        );
      }
      targetId = fallback.id;
      targetSummary = (await this.repo.getUserSummaries([targetId]))[0];
    }

    if (targetId === undefined || !targetSummary) {
      throw new NotFoundException('Người dùng đích không tồn tại');
    }

    let conv = await this.repo.findConversationBetween(user.id, targetId);
    if (!conv) {
      const memberAUserId = user.id;
      const memberBUserId = targetId;
      conv = await this.repo.createConversation({
        type: payload.type,
        status: ChatConversationStatus.OPEN,
        priority: payload.priority ?? ChatConversationPriority.NORMAL,
        memberAUserId,
        memberBUserId,
        relatedBookingId: payload.relatedBookingId ?? null,
        lastMessagePreview: payload.initialMessage ?? null,
        lastMessageAt: new Date(),
        lastMessageSenderId: user.id,
      });

      await this.repo.upsertMember({
        conversationId: conv.id,
        userId: memberAUserId,
        roleInConversation: this.toMemberRole(user.role, 'customer'),
        isPinned: false,
        isMuted: false,
        unreadCount: 0,
      });
      await this.repo.upsertMember({
        conversationId: conv.id,
        userId: memberBUserId,
        roleInConversation: this.toMemberRole(
          targetSummary.role === 'ADMIN' ? 0 : 1,
          'partner',
        ),
        isPinned: false,
        isMuted: false,
        unreadCount: 0,
      });
    }

    if (payload.initialMessage) {
      await this.sendMessage(user, {
        conversationId: conv.id,
        content: payload.initialMessage,
      });
    }

    const detail = await this.getConversationDetail(user, conv.id);
    if (!detail) throw new NotFoundException('Không thể tải cuộc trò chuyện vừa tạo');
    return detail;
  }

  public async setNickname(
    user: UserDecoratorDtoResponse,
    conversationId: number,
    payload: ChatSetNicknameDto,
  ): Promise<void> {
    await this.assertMember(conversationId, user.id);
    const conv = await this.repo.findConversationById(conversationId);
    if (!conv) throw new NotFoundException('Cuộc trò chuyện không tồn tại');
    const otherUserId =
      conv.memberAUserId === user.id ? conv.memberBUserId : conv.memberAUserId;
    await this.repo.updateMember(conversationId, otherUserId, {
      nickname: payload.nickname ?? null,
    });
  }

  public async pinConversation(
    user: UserDecoratorDtoResponse,
    conversationId: number,
    payload: ChatPinConversationDto,
  ): Promise<void> {
    await this.assertMember(conversationId, user.id);
    const isPinned = payload.isPinned ?? true;
    await this.repo.updateMember(conversationId, user.id, { isPinned });
  }

  public async muteConversation(
    user: UserDecoratorDtoResponse,
    conversationId: number,
    payload: ChatMuteConversationDto,
  ): Promise<void> {
    await this.assertMember(conversationId, user.id);
    const ms = MUTE_PRESET_TO_MS[payload.preset];
    const mutedUntil =
      ms == null ? null : new Date(Date.now() + ms);
    await this.repo.updateMember(conversationId, user.id, {
      isMuted: true,
      mutedUntil,
    });
  }

  // ─── CMS actions ───────────────────────────────────────────────────
  public async assignConversation(
    user: UserDecoratorDtoResponse,
    conversationId: number,
    payload: ChatAssignConversationDto,
  ): Promise<void> {
    this.assertStaff(user);
    const conv = await this.repo.findConversationById(conversationId);
    if (!conv) throw new NotFoundException('Cuộc trò chuyện không tồn tại');
    await this.repo.updateConversation(conversationId, {
      assigneeUserId: payload.assigneeId ?? null,
    });
  }

  public async updateStatus(
    user: UserDecoratorDtoResponse,
    conversationId: number,
    payload: ChatUpdateStatusDto,
  ): Promise<void> {
    this.assertStaff(user);
    const conv = await this.repo.findConversationById(conversationId);
    if (!conv) throw new NotFoundException('Cuộc trò chuyện không tồn tại');
    await this.repo.updateConversation(conversationId, {
      status: payload.status,
      priority: payload.priority ?? conv.priority,
    });
  }

  public async listOperatorHotlines(): Promise<ChatConversationResponseDto[]> {
    // Trả về danh sách "operator/admin" thật trong DB: tất cả user có role
    // ADMIN/OWNER. FE dùng để render quick-reply hotline.
    const staff = await this.repo.listStaffUsers();
    if (!staff.length) return [];

    const summaries = await this.repo.getUserSummaries(staff.map((s) => s.id));
    return summaries.map((s) => ({
      conversationId: 0,
      conversationName: s.fullName,
      conversationAvatar: s.avatarUrl || null,
      conversationCreatedAt: new Date().toISOString(),
      lastMessagePreview: null,
      lastMessageAt: null,
      unreadCount: 0,
      type: ChatConversationType.ADMIN,
      toUser: {
        userId: s.id,
        fullName: s.fullName,
        username: s.username,
        avatarUrl: s.avatarUrl,
        email: s.email,
        phone: s.phone,
        role: s.role,
      },
      participants: [],
      status: ChatConversationStatus.OPEN,
      priority: ChatConversationPriority.NORMAL,
      assignedTo: null,
      relatedBookingId: null,
    }));
  }

  // ─── Helpers ───────────────────────────────────────────────────────
  private async assertMember(
    conversationId: number,
    userId: number,
  ): Promise<TbChatConversationMember> {
    const member = await this.repo.findMember(conversationId, userId);
    if (!member) throw new ForbiddenException('Bạn không thuộc cuộc trò chuyện này');
    return member;
  }

  private async assertCanReadConversation(
    conv: TbChatConversation,
    user: UserDecoratorDtoResponse,
  ): Promise<void> {
    if (this.isStaff(user)) return;
    if (conv.memberAUserId !== user.id && conv.memberBUserId !== user.id) {
      throw new ForbiddenException('Bạn không có quyền truy cập cuộc trò chuyện này');
    }
  }

  private async assertCanWriteConversation(
    conv: TbChatConversation,
    user: UserDecoratorDtoResponse,
  ): Promise<void> {
    if (this.isStaff(user)) return;
    if (conv.memberAUserId !== user.id && conv.memberBUserId !== user.id) {
      throw new ForbiddenException('Bạn không có quyền gửi tin nhắn');
    }
  }

  private isStaff(user: UserDecoratorDtoResponse): boolean {
    return user.role === UserRole.ADMIN || user.role === UserRole.OWNER;
  }

  private assertStaff(user: UserDecoratorDtoResponse) {
    if (!this.isStaff(user)) {
      throw new ForbiddenException('Chỉ CMS staff mới có quyền thực hiện');
    }
  }

  private toMemberRole(
    userRole: number,
    perspective: 'customer' | 'partner',
  ): ChatMemberRole {
    if (userRole === UserRole.ADMIN) return ChatMemberRole.ADMIN;
    if (userRole === UserRole.OWNER) {
      return perspective === 'customer'
        ? ChatMemberRole.OPERATOR
        : ChatMemberRole.OPERATOR;
    }
    return perspective === 'customer'
      ? ChatMemberRole.CUSTOMER
      : ChatMemberRole.SUPPORT;
  }

  // ─── Mapping ──────────────────────────────────────────────────────
  private async mapConversations(
    rows: TbChatConversation[],
    currentUserId: number,
  ): Promise<ChatConversationResponseDto[]> {
    if (!rows.length) return [];

    const userIds = new Set<number>();
    rows.forEach((c) => {
      userIds.add(c.memberAUserId);
      userIds.add(c.memberBUserId);
    });
    const allMembers = await Promise.all(
      rows.map((c) => this.repo.findMembers(c.id)),
    );
    allMembers.flat().forEach((m) => userIds.add(m.userId));

    const userSummaries = await this.repo.getUserSummaries([...userIds]);
    const userMap = new Map(userSummaries.map((u) => [u.id, u]));

    return rows.map((conv, idx) => {
      const members = allMembers[idx];
      const myMember = members.find((m) => m.userId === currentUserId);
      const isMember =
        conv.memberAUserId === currentUserId ||
        conv.memberBUserId === currentUserId;
      const otherUserId = isMember
        ? conv.memberAUserId === currentUserId
          ? conv.memberBUserId
          : conv.memberAUserId
        : null;
      const otherUser =
        otherUserId != null ? userMap.get(otherUserId) : undefined;
      const partnerMember =
        otherUserId != null
          ? members.find((m) => m.userId === otherUserId)
          : undefined;

      const participants: ChatParticipantDto[] = members.map((m) => {
        const summary = userMap.get(m.userId);
        return {
          userId: m.userId,
          fullName: summary?.fullName,
          nickname: m.nickname,
          isPinned: m.isPinned,
          isMuted: m.isMuted,
          mutedUntil: m.mutedUntil ? m.mutedUntil.toISOString() : null,
          unreadCount: m.unreadCount,
          isAssigned: m.userId === conv.assigneeUserId,
        };
      });

      const toUser: ChatToUserDto | undefined = otherUser
        ? {
            userId: otherUser.id,
            fullName: otherUser.fullName,
            username: otherUser.username,
            avatarUrl: otherUser.avatarUrl,
            email: otherUser.email,
            phone: otherUser.phone,
            role: otherUser.role,
          }
        : undefined;

      // Staff/admin không phải member của conversation → không có "toUser" duy nhất.
      // Đặt conversationName lấy từ member kia (nếu có 1 member khác staff) hoặc title.
      let displayName =
        partnerMember?.nickname ?? conv.title ?? toUser?.fullName ?? null;
      if (!isMember && members.length === 2) {
        const otherMember = members[0];
        const otherMemberSummary = userMap.get(otherMember.userId);
        displayName =
          otherMember.nickname ?? otherMemberSummary?.fullName ?? conv.title ?? null;
      }

      return {
        conversationId: conv.id,
        conversationName: displayName,
        conversationAvatar: toUser?.avatarUrl ?? null,
        conversationCreatedAt: conv.createdAt.toISOString(),
        lastMessagePreview: conv.lastMessagePreview,
        lastMessageAt: conv.lastMessageAt
          ? conv.lastMessageAt.toISOString()
          : null,
        unreadCount: myMember?.unreadCount ?? 0,
        type: conv.type as unknown as ChatConversationType,
        toUser,
        participants,
        status: conv.status as unknown as ChatConversationStatus,
        priority: conv.priority as unknown as ChatConversationPriority,
        assignedTo:
          conv.assigneeUserId != null
            ? userMap.get(conv.assigneeUserId)?.fullName ?? null
            : null,
        relatedBookingId: conv.relatedBookingId,
      };
    });
  }

  private async mapMessages(
    rows: TbChatMessage[],
    _currentUserId: number,
  ): Promise<ChatMessageResponseDto[]> {
    if (!rows.length) return [];
    const messageIds = rows.map((m) => m.id);
    const userIds = [...new Set(rows.map((m) => m.senderId))];
    const [attachments, users] = await Promise.all([
      this.repo.findAttachmentsByMessages(messageIds),
      this.repo.getUserSummaries(userIds),
    ]);
    const userMap = new Map(users.map((u) => [u.id, u]));
    const attachmentsByMessage = new Map<number, ChatAttachmentDto[]>();
    attachments.forEach((a) => {
      const list = attachmentsByMessage.get(a.messageId) ?? [];
      list.push({
        fileName: a.fileName,
        mimeType: a.mimeType,
        size: a.sizeBytes,
        url: a.url,
        width: a.width ?? undefined,
        height: a.height ?? undefined,
      });
      attachmentsByMessage.set(a.messageId, list);
    });

    return rows.map((m) =>
      ChatMessageResponseDto.from({
        id: m.id,
        conversationId: m.conversationId,
        senderId: m.senderId,
        type: m.type,
        status: m.status,
        content: m.content,
        metadata: m.metadata,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        senderName: userMap.get(m.senderId)?.fullName,
        senderAvatarUrl: userMap.get(m.senderId)?.avatarUrl,
        attachments: attachmentsByMessage.get(m.id) ?? [],
      }),
    );
  }
}
