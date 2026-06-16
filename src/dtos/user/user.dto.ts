import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  ErrorForgotPasswordMessage,
  ErrorLoginMessage,
  ErrorRegisterMessage,
  ErrorResetPasswordMessage,
} from '../../assets/messages/auth.message';
import { UserRole, UserStatus } from './common.dto';

export class LoginPayloadDto {
  @ApiProperty({
    example: '0812345678',
    description: 'Số điện thoại của người dùng',
    required: true,
    minLength: 10,
    maxLength: 10,
    nullable: false,
    type: String,
  })
  @IsNotEmpty({ message: ErrorLoginMessage.PHONE_EMPTY })
  @IsString({ message: ErrorLoginMessage.PHONE_NOT_VALID })
  @MinLength(10, { message: ErrorLoginMessage.PHONE_NOT_VALID })
  @MaxLength(10, { message: ErrorLoginMessage.PHONE_NOT_VALID })
  phoneNumber: string;

  @ApiProperty({
    example: '',
    description: 'Mật khẩu của người dùng',
    required: true,
    nullable: false,
    type: String,
  })
  @IsNotEmpty({ message: ErrorLoginMessage.PASSWORD_EMPTY })
  @IsString({ message: ErrorLoginMessage.PASSWORD_NOT_VALID })
  password: string;
}

export class SignUpPayloadDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Tên đầy đủ của người dùng',
    required: true,
    minLength: 3,
    maxLength: 50,
    nullable: false,
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @ApiProperty({
    example: '0812345678',
    description: 'Số điện thoại của người dùng',
    required: true,
    minLength: 10,
    maxLength: 10,
    nullable: false,
    type: String,
  })
  @IsNotEmpty({ message: ErrorLoginMessage.PHONE_EMPTY })
  @IsString({ message: ErrorLoginMessage.PHONE_NOT_VALID })
  @MinLength(10, { message: ErrorLoginMessage.PHONE_NOT_VALID })
  @MaxLength(10, { message: ErrorLoginMessage.PHONE_NOT_VALID })
  phone: string;

  @ApiProperty({
    example: '',
    description: 'Mật khẩu của người dùng',
    required: true,
    nullable: false,
    type: String,
  })
  @IsNotEmpty({ message: ErrorRegisterMessage.PASSWORD_EMPTY })
  @IsString({ message: ErrorRegisterMessage.PASSWORD_NOT_VALID })
  password: string;

  @ApiProperty({
    example: '',
    description: 'Mật khẩu của người dùng',
    required: true,
    nullable: false,
    type: String,
  })
  @IsNotEmpty({ message: ErrorRegisterMessage.CONFIRM_PASSWORD_EMPTY })
  @IsString({ message: ErrorRegisterMessage.CONFIRM_PASSWORD_NOT_VALID })
  confirm_password: string;

  @ApiProperty({
    example: 1,
    description:
      'Quy tắc nộp đơn của người dùng (1: Nộp đơn tự động, 2: Nộp đơn thủ công)',
    required: true,
    enum: [1, 2],
    nullable: false,
    type: Number,
  })
  @IsInt()
  @IsIn([1, 2])
  acceptRole: number;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email của người dùng',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: ErrorRegisterMessage.EMAIL_EMPTY })
  @IsEmail({}, { message: ErrorRegisterMessage.EMAIL_NOT_VALID })
  email: string;

  @ApiProperty({
    example: '1990-01-01',
    description: 'Ngày sinh của người dùng',
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  dateOfBirth: string;

  @ApiProperty({
    example: 1,
    description: 'Giới tính của người dùng (1: Nam, 2: Nữ, 3: Khác)',
    required: true,
    enum: [1, 2, 3],
    nullable: false,
    type: Number,
  })
  @IsInt()
  @IsIn([1, 2, 3])
  gender: number;
}

export class ForgotPasswordPayloadDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email đã đăng ký',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: ErrorForgotPasswordMessage.EMAIL_NOT_EXIST })
  @IsEmail({}, { message: ErrorForgotPasswordMessage.EMAIL_NOT_EXIST })
  email: string;
}

export class ResetPasswordPayloadDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email đã đăng ký',
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Mã OTP nhận qua email',
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  otp: string;

  @ApiProperty({
    example: 'newPassword123',
    description: 'Mật khẩu mới',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: ErrorResetPasswordMessage.PASSWORD_NOT_VALID })
  @IsString({ message: ErrorResetPasswordMessage.PASSWORD_NOT_VALID })
  password: string;

  @ApiProperty({
    example: 'newPassword123',
    description: 'Xác nhận mật khẩu mới',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: ErrorResetPasswordMessage.PASSWORD_NOT_VALID })
  @IsString({ message: ErrorResetPasswordMessage.PASSWORD_NOT_VALID })
  confirm_password: string;
}

export class ChangePasswordPayloadDto {
  @ApiProperty({
    example: 'oldPassword123',
    description: 'Mật khẩu hiện tại',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: ErrorResetPasswordMessage.PASSWORD_NOT_VALID })
  @IsString({ message: ErrorResetPasswordMessage.PASSWORD_NOT_VALID })
  oldPassword: string;

  @ApiProperty({
    example: 'newPassword123',
    description: 'Mật khẩu mới',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: ErrorResetPasswordMessage.PASSWORD_NOT_VALID })
  @IsString({ message: ErrorResetPasswordMessage.PASSWORD_NOT_VALID })
  password: string;

  @ApiProperty({
    example: 'newPassword123',
    description: 'Xác nhận mật khẩu mới',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: ErrorResetPasswordMessage.PASSWORD_NOT_VALID })
  @IsString({ message: ErrorResetPasswordMessage.PASSWORD_NOT_VALID })
  confirm_password: string;
}

export class MessageResponseDto {
  @ApiProperty({
    example: 'Đổi mật khẩu thành công',
    description: 'Thông báo kết quả',
    required: true,
    type: String,
  })
  message: string;
}

export class AuthResponseDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    description:
      'Token JWT được sử dụng để xác thực người dùng trong các yêu cầu tiếp theo.',
    required: true,
    type: String,
  })
  accessToken: string;

  @ApiProperty({
    example: 'USER',
    description: 'Vai trò của người dùng',
    required: true,
    type: String,
  })
  role: UserRole;
}

/** Gộp `tb_basic_user` + `tb_info_user` (join qua `userCode`). */
export class UserInformationResponseDto {
  @ApiProperty({
    example: 1,
    description: 'ID từ tb_basic_user',
    required: true,
    type: Number,
  })
  id: number;

  @ApiProperty({
    example: 'abc123xyz',
    description: 'Mã người dùng (khóa liên kết 2 bảng)',
    required: true,
    type: String,
  })
  userCode: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Tên người dùng (tb_info_user.userName)',
    required: true,
    type: String,
  })
  userName: string;

  @ApiProperty({
    example: '1990-01-01',
    description: 'Ngày sinh (tb_info_user.userDob)',
    required: true,
    type: String,
  })
  userDob: string;

  @ApiProperty({
    example: 1,
    description: 'Giới tính (tb_info_user.userGender): 1 Nam, 2 Nữ, 3 Khác',
    required: true,
    enum: [1, 2, 3],
    type: Number,
  })
  userGender: number;

  @ApiProperty({
    example: '0812345678',
    description: 'Số điện thoại (tb_basic_user.phone)',
    required: true,
    type: String,
  })
  userPhone: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email (tb_basic_user.email)',
    required: true,
    type: String,
  })
  userEmail: string;

  @ApiProperty({
    example: 'https://cdn.example.com/avatar.png',
    description: 'Ảnh đại diện (tb_info_user.avatar)',
    required: true,
    type: String,
  })
  userAvatar: string;

  @ApiProperty({
    example: UserRole.USER,
    description: 'Vai trò (tb_basic_user.role): 0 Admin, 1 Owner, 2 User',
    required: true,
    enum: UserRole,
    type: Number,
  })
  userRole: UserRole;

  @ApiProperty({
    example: UserStatus.ACTIVE,
    description:
      'Trạng thái (tb_basic_user.status): 0 Active, 1 Inactive, 2 Blocked',
    required: true,
    enum: UserStatus,
    type: Number,
  })
  userStatus: UserStatus;

  @ApiProperty({
    example: true,
    description: 'Xác thực email (tb_basic_user.isEmailVerified)',
    required: true,
    type: Boolean,
  })
  userIsEmailVerified: boolean;
}

export class UpdateUserPayloadDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Tên người dùng',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  userName?: string;

  @ApiProperty({
    example: '1990-01-01',
    description: 'Ngày sinh',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  userDob?: string;

  @ApiProperty({
    example: 1,
    description: 'Giới tính: 1 Nam, 2 Nữ, 3 Khác',
    required: false,
    enum: [1, 2, 3],
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @IsIn([1, 2, 3])
  userGender?: number;

  @ApiProperty({
    example: 'https://cdn.example.com/avatar.png',
    description: 'Ảnh đại diện',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  userAvatar?: string;

  @ApiProperty({
    example: '0812345678',
    description: 'Số điện thoại',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  userPhone?: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsEmail()
  userEmail?: string;
}

export class AdminUpdateUserPayloadDto extends UpdateUserPayloadDto {
  @ApiProperty({
    example: UserRole.USER,
    description: 'Vai trò: 0 Admin, 1 Owner, 2 User',
    required: false,
    enum: UserRole,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @IsIn([UserRole.ADMIN, UserRole.OWNER, UserRole.USER])
  userRole?: UserRole;

  @ApiProperty({
    example: UserStatus.ACTIVE,
    description: 'Trạng thái: 0 Active, 1 Inactive, 2 Blocked',
    required: false,
    enum: UserStatus,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @IsIn([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BLOCKED])
  userStatus?: UserStatus;

  @ApiProperty({
    example: true,
    description: 'Xác thực email',
    required: false,
    type: Boolean,
  })
  @IsOptional()
  userIsEmailVerified?: boolean;
}

export class UserFilterPayloadDto {
  @ApiProperty({
    example: 1,
    description: 'ID từ tb_basic_user',
    required: false,
    type: Number,
  })
  userId?: number;

  @ApiProperty({
    example: 'abc123xyz',
    description: 'Mã người dùng',
    required: false,
    type: String,
  })
  userCode?: string;

  @ApiProperty({
    example: 'John',
    description: 'Tên người dùng (tìm gần đúng)',
    required: false,
    type: String,
  })
  userName?: string;

  @ApiProperty({
    example: '0812',
    description: 'Số điện thoại (tìm gần đúng)',
    required: false,
    type: String,
  })
  userPhone?: string;

  @ApiProperty({
    example: 'john',
    description: 'Email (tìm gần đúng)',
    required: false,
    type: String,
  })
  userEmail?: string;

  @ApiProperty({
    example: UserRole.USER,
    description: 'Vai trò: 0 Admin, 1 Owner, 2 User',
    required: false,
    enum: UserRole,
    type: Number,
  })
  userRole?: UserRole;

  @ApiProperty({
    example: UserStatus.ACTIVE,
    description: 'Trạng thái: 0 Active, 1 Inactive, 2 Blocked',
    required: false,
    enum: UserStatus,
    type: Number,
  })
  userStatus?: UserStatus;

  @ApiProperty({
    example: 1,
    description: 'Giới tính: 1 Nam, 2 Nữ, 3 Khác',
    required: false,
    enum: [1, 2, 3],
    type: Number,
  })
  userGender?: number;
}
