/** Thông báo validate cho CMS tạo / cập nhật tài xế */
export class CmsDriverValidationMessage {
  static readonly DRIVER_NAME_EMPTY = 'Tên tài xế không được để trống';
  static readonly DRIVER_NAME_INVALID = 'Tên tài xế không hợp lệ';
  static readonly DRIVER_NAME_TOO_LONG =
    'Tên tài xế không được vượt quá 255 ký tự';

  static readonly DRIVER_CODE_INVALID = 'Mã tài xế không hợp lệ';
  static readonly DRIVER_CODE_TOO_LONG =
    'Mã tài xế không được vượt quá 24 ký tự';

  static readonly VERHICAL_ID_EMPTY = 'ID phương tiện không được để trống';
  static readonly VERHICAL_ID_INVALID = 'ID phương tiện phải là số nguyên dương';

  static readonly LICENSE_EMPTY = 'Số bằng lái không được để trống';
  static readonly LICENSE_INVALID = 'Số bằng lái không hợp lệ';
  static readonly LICENSE_TOO_LONG =
    'Số bằng lái không được vượt quá 50 ký tự';

  static readonly PHONE_EMPTY = 'Số điện thoại không được để trống';
  static readonly PHONE_INVALID = 'Số điện thoại không hợp lệ';
  static readonly PHONE_TOO_LONG =
    'Số điện thoại không được vượt quá 50 ký tự';

  static readonly EMAIL_EMPTY = 'Email không được để trống';
  static readonly EMAIL_INVALID = 'Email không hợp lệ';
  static readonly EMAIL_TOO_LONG = 'Email không được vượt quá 100 ký tự';

  static readonly DRIVER_STATUS_EMPTY = 'Trạng thái tài xế không được để trống';
  static readonly DRIVER_STATUS_INVALID = 'Trạng thái tài xế không hợp lệ';
  static readonly DRIVER_STATUS_NOT_IN =
    'Trạng thái tài xế phải là ACTIVE hoặc INACTIVE';

  static readonly DESCRIPTION_INVALID = 'Mô tả không hợp lệ';
  static readonly DRIVER_ID_INVALID = 'ID tài xế phải là số nguyên dương';
}

export class CmsDriverErrorMessage {
  static readonly NOT_FOUND = 'Không tìm thấy tài xế';
}

export class CmsDriverSuccessMessage {
  static readonly DELETE_SUCCESS = 'Đã vô hiệu hóa tài xế';
}
