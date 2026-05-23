/** Thông báo validate cho CMS tạo / cập nhật chuyến mẫu */
export class CmsTripValidationMessage {
  static readonly TRIP_NAME_EMPTY = 'Tên chuyến không được để trống';
  static readonly TRIP_NAME_INVALID = 'Tên chuyến không hợp lệ';
  static readonly TRIP_NAME_TOO_LONG =
    'Tên chuyến không được vượt quá 255 ký tự';

  static readonly TRIP_CODE_INVALID = 'Mã chuyến không hợp lệ';
  static readonly TRIP_CODE_TOO_LONG =
    'Mã chuyến không được vượt quá 24 ký tự';

  static readonly ROAD_ID_EMPTY = 'ID tuyến đường không được để trống';
  static readonly ROAD_ID_INVALID = 'ID tuyến đường phải là số nguyên dương';

  static readonly TRIP_STATUS_EMPTY = 'Trạng thái chuyến không được để trống';
  static readonly TRIP_STATUS_INVALID = 'Trạng thái chuyến không hợp lệ';
  static readonly TRIP_STATUS_NOT_IN =
    'Trạng thái chuyến phải là ACTIVE hoặc INACTIVE';

  static readonly DESCRIPTION_INVALID = 'Mô tả không hợp lệ';
  static readonly TRIP_ID_INVALID = 'ID chuyến phải là số nguyên dương';
}

export class CmsTripSuccessMessage {
  static readonly DELETE_SUCCESS = 'Đã vô hiệu hóa chuyến mẫu';
}
