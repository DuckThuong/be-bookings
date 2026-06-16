import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from '../dtos/jwt.dto';
import {
  ChatMessageResponseDto,
  ChatPaginatedMessagesDto,
} from '../dtos/chat.dto';
import { UserRole } from '../dtos/user/common.dto';

interface AuthedSocket extends Socket {
  data: {
    userId: number;
    role: UserRole;
  };
}

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  afterInit() {
    this.logger.log('ChatGateway initialized at namespace /chat');
  }

  handleConnection(client: AuthedSocket) {
    const token = this.extractToken(client);
    if (!token) {
      client.disconnect(true);
      return;
    }
    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret:
          this.configService.get<string>('JWT_SECRET') ||
          'duckthuong-28072003-secretkey',
      });
      client.data.userId = payload.sub;
      client.data.role = payload.role;
      this.logger.log(
        `WS connect: socket=${client.id} user=${payload.sub} role=${payload.role}`,
      );
    } catch (err) {
      this.logger.warn(`WS auth failed: ${(err as Error).message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthedSocket) {
    this.logger.log(
      `WS disconnect: socket=${client.id} user=${client.data?.userId}`,
    );
  }

  // ─── Client → Server ──────────────────────────────────────────────
  @SubscribeMessage('chat.join')
  onJoin(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: { conversationId: number },
  ) {
    if (!payload?.conversationId) {
      return { success: false, message: 'conversationId is required' };
    }
    const room = this.room(payload.conversationId);
    void client.join(room);
    return { success: true, data: { room } };
  }

  @SubscribeMessage('chat.leave')
  onLeave(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() payload: { conversationId: number },
  ) {
    if (!payload?.conversationId) {
      return { success: false, message: 'conversationId is required' };
    }
    const room = this.room(payload.conversationId);
    void client.leave(room);
    return { success: true, data: { room } };
  }

  @SubscribeMessage('chat.message.read')
  onRead(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody()
    payload: { conversationId: number; messageId: number },
  ) {
    if (!payload?.conversationId || !payload?.messageId) {
      return { success: false, message: 'invalid payload' };
    }
    this.server.to(this.room(payload.conversationId)).emit('chat.message.read', {
      event: 'chat.message.read',
      data: {
        conversationId: payload.conversationId,
        userId: client.data.userId,
        messageId: payload.messageId,
      },
      meta: { sentAt: new Date().toISOString(), version: 1 },
    });
    return { success: true };
  }

  // ─── Server → Client ──────────────────────────────────────────────
  public emitMessageNew(
    conversationId: number,
    message: ChatMessageResponseDto,
  ) {
    this.server.to(this.room(conversationId)).emit('chat.message.sent', {
      event: 'chat.message.sent',
      data: message,
      meta: { sentAt: new Date().toISOString(), version: 1 },
    });
  }

  public emitMessageStatusUpdated(
    conversationId: number,
    payload: {
      messageId: number;
      status: 'SENT' | 'DELIVERED' | 'READ';
      updatedAt: string;
    },
  ) {
    this.server.to(this.room(conversationId)).emit('chat.message.status.updated', {
      event: 'chat.message.status.updated',
      data: { conversationId, ...payload },
      meta: { sentAt: new Date().toISOString(), version: 1 },
    });
  }

  public emitMessageRead(
    conversationId: number,
    payload: { conversationId: number; userId: number; lastMessageId: number },
  ) {
    this.server.to(this.room(conversationId)).emit('chat.message.read', {
      event: 'chat.message.read',
      data: payload,
      meta: { sentAt: new Date().toISOString(), version: 1 },
    });
  }

  public emitConversationUpdated(
    conversationId: number,
    payload: Record<string, unknown>,
  ) {
    this.server.to(this.room(conversationId)).emit('chat.conversation.updated', {
      event: 'chat.conversation.updated',
      data: payload,
      meta: { sentAt: new Date().toISOString(), version: 1 },
    });
  }

  // ─── Helpers ─────────────────────────────────────────────────────
  private room(conversationId: number) {
    return `conversation:${conversationId}`;
  }

  private extractToken(client: Socket): string | null {
    const authToken = (client.handshake.auth as { token?: string } | undefined)
      ?.token;
    if (authToken && authToken.startsWith('Bearer ')) {
      return authToken.slice(7);
    }
    if (authToken) return authToken;

    const header = client.handshake.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
      return header.slice(7);
    }
    const queryToken = client.handshake.query?.token;
    if (typeof queryToken === 'string' && queryToken) return queryToken;
    return null;
  }
}

export type { AuthedSocket };
