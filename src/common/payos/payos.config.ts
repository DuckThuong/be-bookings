import { ConfigService } from '@nestjs/config';

export interface PayOSConfig {
  clientId: string;
  apiKey: string;
  checksumKey: string;
  returnUrl: string;
  cancelUrl: string;
  webhookUrl: string;
}

export function getPayOSConfig(configService: ConfigService): PayOSConfig {
  return {
    clientId: configService.get<string>('PAYSOS_CLIENT_ID', ''),
    apiKey: configService.get<string>('PAYSOS_API_KEY', ''),
    checksumKey: configService.get<string>('PAYSOS_CHECKSUM_KEY', ''),
    returnUrl: configService.get<string>('PAYSOS_RETURN_URL', ''),
    cancelUrl: configService.get<string>('PAYSOS_CANCEL_URL', ''),
    webhookUrl: configService.get<string>('PAYSOS_WEBHOOK_URL', ''),
  };
}
