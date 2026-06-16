import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  ChatConversationStatus,
  ChatMemberRole,
  ChatMessageStatus,
  ChatMessageType,
  TbChatConversation,
  TbChatConversationMember,
  TbChatMessage,
  TbChatMessageAttachment,
  TbChatMessageRecipient,
} from '../entities/chat';
import { TbBasicUser } from '../entities/user/basic-user.entity';
import { TbInfoUser } from '../entities/user/info-user.entity';

@Injectable()
export class ChatRepository {
  constructor(
    @InjectRepository(TbChatConversation)
    private readonly convRepo: Repository<TbChatConversation>,
    @InjectRepository(TbChatConversationMember)
    private readonly memberRepo: Repository<TbChatConversationMember>,
    @InjectRepository(TbChatMessage)
    private readonly messageRepo: Repository<TbChatMessage>,
    @InjectRepository(TbChatMessageAttachment)
    private readonly attachmentRepo: Repository<TbChatMessageAttachment>,
    @InjectRepository(TbChatMessageRecipient)
    private readonly recipientRepo: Repository<TbChatMessageRecipient>,
    @InjectRepository(TbBasicUser)
    private readonly basicUserRepo: Repository<TbBasicUser>,
    @InjectRepository(TbInfoUser)
    private readonly infoUserRepo: Repository<TbInfoUser>,
  ) {}

  // ─── Conversation ────────────────────────────────────────────────────
  public async findConversationById(id: number) {
    return this.convRepo.findOne({ where: { id } });
  }

  public async findConversationBetween(
    userAId: number,
    userBId: number,
  ): Promise<TbChatConversation | null> {
    return this.convRepo
      .createQueryBuilder('c')
      .where(
        '(c.memberAUserId = :a AND c.memberBUserId = :b) OR (c.memberAUserId = :b AND c.memberBUserId = :a)',
        { a: userAId, b: userBId },
      )
      .getOne();
  }

  public async createConversation(
    payload: Partial<TbChatConversation>,
  ): Promise<TbChatConversation> {
    const entity = this.convRepo.create(payload);
    return this.convRepo.save(entity);
  }

  public async updateConversation(
    id: number,
    payload: Partial<TbChatConversation>,
  ): Promise<void> {
    await this.convRepo.update({ id }, payload);
  }

  public async listConversationsForUser(userId: number) {
    return this.convRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect(
        'participants',
        'm',
        'm.conversation_id = c.id AND m.user_id = :userId',
        { userId },
      )
      .orderBy('c.last_message_at', 'DESC', 'NULLS LAST')
      .addOrderBy('c.id', 'DESC')
      .getMany();
  }

  public async listAllConversations() {
    return this.convRepo
      .createQueryBuilder('c')
      .orderBy('c.last_message_at', 'DESC', 'NULLS LAST')
      .addOrderBy('c.id', 'DESC')
      .getMany();
  }

  // ─── Members ────────────────────────────────────────────────────────
  public async findMember(
    conversationId: number,
    userId: number,
  ): Promise<TbChatConversationMember | null> {
    return this.memberRepo.findOne({
      where: { conversationId, userId },
    });
  }

  public async findMembers(conversationId: number) {
    return this.memberRepo.find({ where: { conversationId } });
  }

  public async findMembersByUser(userId: number) {
    return this.memberRepo.find({ where: { userId } });
  }

  public async upsertMember(payload: Partial<TbChatConversationMember>) {
    const existing = await this.memberRepo.findOne({
      where: {
        conversationId: payload.conversationId!,
        userId: payload.userId!,
      },
    });
    if (existing) {
      Object.assign(existing, payload);
      return this.memberRepo.save(existing);
    }
    const entity = this.memberRepo.create(payload);
    return this.memberRepo.save(entity);
  }

  public async updateMember(
    conversationId: number,
    userId: number,
    payload: Partial<TbChatConversationMember>,
  ): Promise<void> {
    await this.memberRepo.update({ conversationId, userId }, payload);
  }

  public async incrementUnread(
    conversationId: number,
    exceptUserId: number,
  ): Promise<void> {
    await this.memberRepo
      .createQueryBuilder()
      .update(TbChatConversationMember)
      .set({ unreadCount: () => 'unread_count + 1' })
      .where('conversation_id = :cid AND user_id <> :uid', {
        cid: conversationId,
        uid: exceptUserId,
      })
      .execute();
  }

  public async resetUnread(
    conversationId: number,
    userId: number,
  ): Promise<void> {
    await this.memberRepo.update(
      { conversationId, userId },
      { unreadCount: 0, lastReadAt: new Date() },
    );
  }

  // ─── Messages ───────────────────────────────────────────────────────
  public async createMessage(
    payload: Partial<TbChatMessage>,
  ): Promise<TbChatMessage> {
    const entity = this.messageRepo.create({
      type: ChatMessageType.TEXT,
      status: ChatMessageStatus.SENT,
      ...payload,
    });
    return this.messageRepo.save(entity);
  }

  public async findMessageById(id: number) {
    return this.messageRepo.findOne({ where: { id } });
  }

  public async listMessages(
    conversationId: number,
    page: number,
    limit: number,
  ): Promise<[TbChatMessage[], number]> {
    return this.messageRepo.findAndCount({
      where: { conversationId },
      order: { createdAt: 'DESC', id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  public async updateMessage(
    id: number,
    payload: Partial<TbChatMessage>,
  ): Promise<void> {
    await this.messageRepo.update({ id }, payload as object);
  }

  // ─── Attachments ───────────────────────────────────────────────────
  public async createAttachments(
    items: Partial<TbChatMessageAttachment>[],
  ): Promise<TbChatMessageAttachment[]> {
    if (!items.length) return [];
    const entities = this.attachmentRepo.create(items);
    return this.attachmentRepo.save(entities);
  }

  public async findAttachmentsByMessages(messageIds: number[]) {
    if (!messageIds.length) return [];
    return this.attachmentRepo.find({
      where: { messageId: In(messageIds) },
    });
  }

  // ─── Recipients (read receipts) ────────────────────────────────────
  public async insertRecipients(
    items: Partial<TbChatMessageRecipient>[],
  ): Promise<void> {
    if (!items.length) return;
    await this.recipientRepo
      .createQueryBuilder()
      .insert()
      .into(TbChatMessageRecipient)
      .values(items)
      .orIgnore()
      .execute();
  }

  public async markRecipientsRead(
    conversationId: number,
    userId: number,
    lastMessageId: number,
  ): Promise<void> {
    await this.recipientRepo
      .createQueryBuilder()
      .update(TbChatMessageRecipient)
      .set({ readAt: new Date() })
      .where(
        'conversation_id = :cid AND user_id = :uid AND read_at IS NULL AND message_id <= :mid',
        { cid: conversationId, uid: userId, mid: lastMessageId },
      )
      .execute();
  }

  // ─── User lookups (gộp 2 bảng tb_basic_user + tb_info_user) ─────────
  public async getUserSummaries(userIds: number[]) {
    if (!userIds.length) return [];
    const basics = await this.basicUserRepo.find({
      where: { id: In(userIds) },
    });
    const userCodes = basics.map((b) => b.userCode);
    const infos = userCodes.length
      ? await this.infoUserRepo.find({ where: { userCode: In(userCodes) } })
      : [];
    const infoByCode = new Map(infos.map((i) => [i.userCode, i]));

    return basics.map((b) => {
      const info = infoByCode.get(b.userCode);
      return {
        id: b.id,
        userCode: b.userCode,
        fullName: info?.userName ?? b.phone ?? `User #${b.id}`,
        username: b.email ?? info?.userName ?? `user_${b.id}`,
        email: b.email,
        phone: b.phone,
        avatarUrl: info?.avatar ?? '',
        role: this.mapRole(b.role),
      };
    });
  }

  private mapRole(role: number): 'OPERATOR' | 'ADMIN' | 'SUPPORT' | 'USER' {
    // UserRole: 0=ADMIN, 1=OWNER, 2=USER
    if (role === 0) return 'ADMIN';
    if (role === 1) return 'OPERATOR';
    return 'USER';
  }
}

export { ChatConversationStatus, ChatMemberRole, ChatMessageType, ChatMessageStatus };