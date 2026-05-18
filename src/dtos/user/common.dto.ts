export enum UserStatus {
  ACTIVE = 0,
  INACTIVE = 1,
  BLOCKED = 2,
}

export enum UserRole {
  ADMIN = 0,
  OWNER = 1,
  USER = 2,
}

export class UserDecoratorDtoResponse {
  id: number;
  userCode: string;
  phone: string;
  email: string;
  password: string;
  fullName?: string;
  dateOfBirth?: string;
  status: UserStatus;
  role: UserRole;
  isEmailVerified: boolean;
}
