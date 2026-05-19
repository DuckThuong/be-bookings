export class ErrorUserMessage {
  static readonly FORBIDDEN = 'Bạn không có quyền truy cập';
  static readonly ADMIN_CANNOT_CHANGE_OWN_ROLE =
    'Admin không thể đổi vai trò của chính mình';
  static readonly ADMIN_CANNOT_DEACTIVATE_SELF =
    'Admin không thể khóa tài khoản của chính mình';
  static readonly USER_ROLE_NOT_VALID = 'Vai trò không hợp lệ';
  static readonly USER_STATUS_NOT_VALID = 'Trạng thái không hợp lệ';
  static readonly PAYLOAD_EMPTY = 'Không có dữ liệu cần cập nhật';
  static readonly USER_NAME_NOT_VALID = 'Tên người dùng không hợp lệ';
  static readonly USER_DOB_NOT_VALID = 'Ngày sinh không hợp lệ';
  static readonly USER_GENDER_NOT_VALID = 'Giới tính không hợp lệ';
  static readonly USER_PHONE_NOT_VALID = 'Số điện thoại không hợp lệ';
  static readonly USER_EMAIL_NOT_VALID = 'Email không hợp lệ';
}
