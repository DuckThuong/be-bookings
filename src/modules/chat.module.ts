import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatController } from '../controllers/chat.controller';
import { ChatService } from '../services/chat.service';
import { ChatRepository } from '../repositories/chat.repository';
import { ChatGateway } from '../socket/chat.gateway';
import {
  TbChatConversation,
  TbChatConversationMember,
  TbChatMessage,
  TbChatMessageAttachment,
  TbChatMessageRecipient,
} from '../entities/chat';
import { TbBasicUser } from '../entities/user/basic-user.entity';
import { TbInfoUser } from '../entities/user/info-user.entity';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuthModule } from './auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TbChatConversation,
      TbChatConversationMember,
      TbChatMessage,
      TbChatMessageAttachment,
      TbChatMessageRecipient,
      TbBasicUser,
      TbInfoUser,
    ]),
    AuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') ||
          'duckthuong-28072003-secretkey',
      }),
    }),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatRepository, ChatGateway, RolesGuard],
  exports: [ChatService, ChatRepository],
})
export class ChatModule {}
