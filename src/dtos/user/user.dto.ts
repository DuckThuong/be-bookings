import { ApiProperty } from '@nestjs/swagger';

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
  phoneNumber: string;

  @ApiProperty({
    example: '',
    description: 'Mật khẩu của người dùng',
    required: true,
    nullable: false,
    type: String,
  })
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
  phone: string;

  @ApiProperty({
    example: '',
    description: 'Mật khẩu của người dùng',
    required: true,
    nullable: false,
    type: String,
  })
  password: string;

  @ApiProperty({
    example: '',
    description: 'Mật khẩu của người dùng',
    required: true,
    nullable: false,
    type: String,
  })
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
  acceptRole: number;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email của người dùng',
    required: true,
    type: String,
  })
  email: string;

  @ApiProperty({
    example: '1990-01-01',
    description: 'Ngày sinh của người dùng',
    required: true,
    type: String,
  })
  dateOfBirth: string;

  @ApiProperty({
    example: 1,
    description: 'Giới tính của người dùng (1: Nam, 2: Nữ, 3: Khác)',
    required: true,
    enum: [1, 2, 3],
    nullable: false,
    type: Number,
  })
  gender: number;
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
}

