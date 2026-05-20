import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { MailErrorMessage } from '../assets/messages/auth.message';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendPasswordResetOtp(email: string, otp: string): Promise<void> {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    const from =
      this.configService.get<string>('RESEND_FROM_EMAIL') ??
      'onboarding@resend.dev';

    if (!apiKey) {
      this.logger.warn(
        `[DEV] RESEND_API_KEY chưa cấu hình — OTP cho ${email}: ${otp}`,
      );
      return;
    }

    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: email,
      subject: 'Mã OTP đặt lại mật khẩu',
      html: `
        <p>Bạn đã yêu cầu đặt lại mật khẩu.</p>
        <p>Mã OTP của bạn: <strong>${otp}</strong></p>
        <p>Mã có hiệu lực trong 10 phút. Không chia sẻ mã này với ai.</p>
      `,
    });

    if (error) {
      this.logger.error(`Gửi email thất bại: ${JSON.stringify(error)}`);
      throw new Error(MailErrorMessage.SEND_EMAIL_FAILED);
    }
  }
}
