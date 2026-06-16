import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChatTables1700000000000 implements MigrationInterface {
  name = 'ChatTables1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`tb_chat_conversation\` (
        \`id\` int NOT NULL AUTO_INCREMENT COMMENT 'Primary key',
        \`type\` enum('OPERATOR','ADMIN','SUPPORT','CUSTOMER') NOT NULL DEFAULT 'OPERATOR' COMMENT 'Loại cuộc trò chuyện',
        \`status\` enum('OPEN','PENDING','RESOLVED','CLOSED') NOT NULL DEFAULT 'OPEN' COMMENT 'Trạng thái xử lý',
        \`priority\` enum('LOW','NORMAL','HIGH','URGENT') NOT NULL DEFAULT 'NORMAL' COMMENT 'Mức độ ưu tiên',
        \`member_a_user_id\` int NOT NULL COMMENT 'User id phía khách hàng',
        \`member_b_user_id\` int NOT NULL COMMENT 'User id phía đối tác (nhà xe/admin/operator)',
        \`assignee_user_id\` int NULL COMMENT 'User id của CMS staff được phân công',
        \`related_booking_id\` varchar(255) NULL COMMENT 'Mã booking liên quan (nếu có)',
        \`title\` varchar(500) NULL COMMENT 'Tiêu đề/tên cuộc trò chuyện',
        \`lastMessagePreview\` varchar(1000) NULL COMMENT 'Xem trước tin nhắn cuối',
        \`last_message_at\` datetime NULL COMMENT 'Thời điểm tin nhắn cuối',
        \`last_message_sender_id\` int NULL COMMENT 'User id gửi tin nhắn cuối',
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Created date',
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Updated date',
        PRIMARY KEY (\`id\`),
        KEY \`idx_chat_conv_member_a\` (\`member_a_user_id\`),
        KEY \`idx_chat_conv_member_b\` (\`member_b_user_id\`),
        KEY \`idx_chat_conv_status\` (\`status\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`tb_chat_conversation_member\` (
        \`id\` int NOT NULL AUTO_INCREMENT COMMENT 'Primary key',
        \`conversationId\` int NOT NULL COMMENT 'FK tb_chat_conversation.id',
        \`userId\` int NOT NULL COMMENT 'User id tham gia cuộc trò chuyện',
        \`roleInConversation\` enum('CUSTOMER','OPERATOR','ADMIN','SUPPORT') NOT NULL COMMENT 'Vai trò trong cuộc trò chuyện',
        \`nickname\` varchar(255) NULL COMMENT 'Biệt danh do phía đối diện đặt',
        \`isPinned\` tinyint NOT NULL DEFAULT 0 COMMENT 'Ghim cuộc trò chuyện',
        \`isMuted\` tinyint NOT NULL DEFAULT 0 COMMENT 'Tắt thông báo',
        \`mutedUntil\` datetime NULL COMMENT 'Mute tới thời điểm (null = tắt vĩnh viễn)',
        \`unreadCount\` int NOT NULL DEFAULT 0 COMMENT 'Số tin nhắn chưa đọc của user này',
        \`lastReadAt\` datetime NULL COMMENT 'Lần cuối user này đọc cuộc trò chuyện',
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Created date',
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Updated date',
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uk_chat_member_unique\` (\`conversationId\`, \`userId\`),
        KEY \`idx_chat_member_user\` (\`userId\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`tb_chat_message\` (
        \`id\` int NOT NULL AUTO_INCREMENT COMMENT 'Primary key',
        \`conversationId\` int NOT NULL COMMENT 'FK tb_chat_conversation.id',
        \`senderId\` int NOT NULL COMMENT 'User id gửi tin nhắn',
        \`type\` enum('TEXT','IMAGE','FILE','SYSTEM') NOT NULL DEFAULT 'TEXT' COMMENT 'Loại tin nhắn',
        \`status\` enum('SENT','DELIVERED','READ') NOT NULL DEFAULT 'SENT' COMMENT 'Trạng thái gửi',
        \`content\` text NULL COMMENT 'Nội dung tin nhắn',
        \`metadata\` json NULL COMMENT 'Metadata tuỳ chỉnh (vd: clientMessageId, edit history)',
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Created date',
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Updated date',
        PRIMARY KEY (\`id\`),
        KEY \`idx_chat_msg_conversation\` (\`conversationId\`, \`created_at\`),
        KEY \`idx_chat_msg_sender\` (\`senderId\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`tb_chat_message_attachment\` (
        \`id\` int NOT NULL AUTO_INCREMENT COMMENT 'Primary key',
        \`messageId\` int NOT NULL COMMENT 'FK tb_chat_message.id',
        \`fileName\` varchar(500) NOT NULL COMMENT 'Tên file gốc',
        \`mimeType\` varchar(255) NOT NULL COMMENT 'MIME type',
        \`sizeBytes\` int NOT NULL COMMENT 'Kích thước file (bytes)',
        \`url\` varchar(1000) NOT NULL COMMENT 'URL truy cập file',
        \`width\` int NULL COMMENT 'Chiều rộng ảnh (nếu là ảnh)',
        \`height\` int NULL COMMENT 'Chiều cao ảnh (nếu là ảnh)',
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Created date',
        PRIMARY KEY (\`id\`),
        KEY \`idx_chat_attach_msg\` (\`messageId\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`tb_chat_message_recipient\` (
        \`id\` int NOT NULL AUTO_INCREMENT COMMENT 'Primary key',
        \`messageId\` int NOT NULL COMMENT 'FK tb_chat_message.id',
        \`conversationId\` int NOT NULL COMMENT 'FK tb_chat_conversation.id (denormalized để query nhanh)',
        \`userId\` int NOT NULL COMMENT 'User id nhận tin nhắn',
        \`deliveredAt\` datetime NULL COMMENT 'Thời điểm client nhận',
        \`readAt\` datetime NULL COMMENT 'Thời điểm user đọc',
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Created date',
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uk_chat_recipient_unique\` (\`messageId\`, \`userId\`),
        KEY \`idx_chat_recipient_user_unread\` (\`userId\`, \`readAt\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`tb_chat_message_recipient\``);
    await queryRunner.query(`DROP TABLE \`tb_chat_message_attachment\``);
    await queryRunner.query(`DROP TABLE \`tb_chat_message\``);
    await queryRunner.query(`DROP TABLE \`tb_chat_conversation_member\``);
    await queryRunner.query(`DROP TABLE \`tb_chat_conversation\``);
  }
}
