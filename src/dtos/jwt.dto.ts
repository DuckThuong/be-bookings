import { UserRole, UserStatus } from './user/common.dto';

export class JwtPayload {
  sub: number;
  userCode: string;
  username: string;
  email: string;
  fullName?: string;
  dateOfBirth?: Date;
  status: UserStatus;
  role: UserRole;
  isEmailVerified: boolean;
  iat?: number;
  exp?: number;
}

export interface JwtSignInPayload {
  email: string;
  password: string;
}

export interface JwtSignInDtoResponse {
  access_token: string;
}
