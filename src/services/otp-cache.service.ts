import { Injectable } from '@nestjs/common';

interface OtpEntry {
  otp: string;
  expiresAt: number;
}

const OTP_TTL_MS = 10 * 60 * 1000;

@Injectable()
export class OtpCacheService {
  private readonly store = new Map<string, OtpEntry>();

  set(email: string, otp: string): void {
    this.store.set(email.toLowerCase().trim(), {
      otp,
      expiresAt: Date.now() + OTP_TTL_MS,
    });
  }

  verify(email: string, otp: string): 'valid' | 'not_found' | 'expired' | 'invalid' {
    const key = email.toLowerCase().trim();
    const entry = this.store.get(key);
    if (!entry) {
      return 'not_found';
    }
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return 'expired';
    }
    if (!equalOtp(entry.otp, otp)) {
      return 'invalid';
    }
    return 'valid';
  }

  delete(email: string): void {
    this.store.delete(email.toLowerCase().trim());
  }
}

function equalOtp(stored: string, input: string): boolean {
  return stored.trim() === input.trim();
}
