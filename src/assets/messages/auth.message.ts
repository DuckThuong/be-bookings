export class successLoginMessage {
  static readonly LOGIN_SUCCESS = 'Đăng nhập thành công';
}

export class ErrorLoginMessage {
  static readonly LOGIN_FAILED = 'Đăng nhập thất bại';
  static readonly PHONE_EMPTY = 'Số điện thoại không được để trống';
  static readonly PHONE_NOT_VALID = 'Số điện thoại không hợp lệ';
  static readonly PASSWORD_EMPTY = 'Mật khẩu không được để trống';
  static readonly PASSWORD_NOT_VALID = 'Mật khẩu không hợp lệ';
  static readonly PASSWORD_INCORRECT = 'Mật khẩu không chính xác';
  static readonly USER_NOT_FOUND = 'Người dùng không tồn tại';
  static readonly USER_NOT_ACTIVE = 'Người dùng không hoạt động';
  static readonly USER_NOT_VERIFIED = 'Người dùng không được xác thực';
  static readonly USER_NOT_VALID = 'Người dùng không hợp lệ';
  static readonly TOKEN_NOT_VALID = 'Token không hợp lệ';
  static readonly TOKEN_NOT_FOUND = 'Token không tồn tại';
  static readonly TOKEN_NOT_VERIFIED = 'Token không được xác thực';
  static readonly TOKEN_EXPIRED = 'Token đã hết hạn';
}

export class SuccessLogoutMessage {
  static readonly LOGOUT_SUCCESS = 'Đăng xuất thành công';
}

export class ErrorLogoutMessage {
  static readonly LOGOUT_FAILED = 'Đăng xuất thất bại';
  static readonly TOKEN_EMPTY = 'Token không được để trống';
  static readonly TOKEN_NOT_VALID = 'Token không hợp lệ';
  static readonly TOKEN_NOT_FOUND = 'Token không tồn tại';
  static readonly TOKEN_NOT_VERIFIED = 'Token không được xác thực';
  static readonly TOKEN_EXPIRED = 'Token đã hết hạn';
}

export class MailMessage {
  static readonly OTP_SENT = 'OTP đã được gửi đến email của bạn';
  static readonly OTP_NOT_FOUND = 'OTP không tồn tại hoặc đã hết hạn';
  static readonly OTP_EXPIRED = 'OTP đã hết hạn';
  static readonly OTP_INVALID = 'OTP không chính xác';
  static readonly OTP_VERIFIED = 'OTP verified successfully';
}

export enum MailErrorMessage {
  SEND_EMAIL_FAILED = 'Gửi email thất bại',
  MAIL_IS_NOT_VALID = 'Số điện thoại không hợp lệ',
  MAIL_IS_NOT_EXIST = 'Số điện thoại chưa được đăng ký',
  OTP_NOT_FOUND = 'OTP không tồn tại hoặc đã hết hạn',
  OTP_EXPIRED = 'OTP đã hết hạn',
  OTP_INVALID = 'OTP không chính xác',
  RESEND_API_KEY_MISSING = 'RESEND_API_KEY không được cấu hình',
}

export enum MailSuccessMessage {
  OTP_SENT = 'OTP đã được gửi đến email của bạn',
  OTP_VERIFIED = 'Xác thực OTP thành công',
  EMAIL_SENT = 'Email đã được gửi thành công',
}

export class SuccessRegisterMessage {
  static readonly REGISTER_SUCCESS = 'Đăng ký thành công';
}

export class ErrorRegisterMessage {
  static readonly EMAIL_EMPTY = 'Email không được để trống';
  static readonly EMAIL_NOT_VALID = 'Email không hợp lệ';
  static readonly PASSWORD_EMPTY = 'Mật khẩu không được để trống';
  static readonly PASSWORD_NOT_VALID = 'Mật khẩu không hợp lệ';
  static readonly CONFIRM_PASSWORD_EMPTY = 'CONFIRM PASSWORD EMPTY';
  static readonly CONFIRM_PASSWORD_NOT_VALID = 'Xác nhận mật khẩu không hợp lệ';
  static readonly USER_ALREADY_EXISTS = 'Người dùng đã tồn tại';
  static readonly EMAIL_ALREADY_EXISTS = 'Email đã tồn tại';
  static readonly PHONE_NUMBER_ALREADY_EXISTS = 'Số điện thoại đã tồn tại';
  static readonly REGISTER_FAILED = 'Đăng ký thất bại';
}

export class SuccessResetPasswordMessage {
  static readonly RESET_SUCCESS = 'Đổi mật khẩu thành công';
}

export class ErrorResetPasswordMessage {
  static readonly RESET_ERROR = 'Đổi mật khẩu không thành công';
  static readonly PASSWORD_NOT_VALID = 'Mật khẩu không chính xác.';
  static readonly PASSWORD_IS_EQUAL = 'Mật khẩu mới phải khác mật khẩu cũ.';
}

export class SuccessForgotPasswordMessage {
  static readonly VERIFY_SUCCESS = 'Email xác thực thành công.';
}

export class ErrorForgotPasswordMessage {
  static readonly FORGOT_ERROR = 'Đã xảy ra lỗi';
  static readonly EMAIL_NOT_EXIST = 'Email không tồn tại.';
}
