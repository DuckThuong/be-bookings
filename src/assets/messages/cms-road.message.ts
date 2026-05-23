/** Thông báo validate cho CMS tạo / cập nhật tuyến đường */
export class CmsRoadValidationMessage {
  static readonly ROAD_NAME_EMPTY = 'Tên tuyến không được để trống';
  static readonly ROAD_NAME_INVALID = 'Tên tuyến không hợp lệ';
  static readonly ROAD_NAME_TOO_LONG =
    'Tên tuyến không được vượt quá 255 ký tự';

  static readonly ROAD_CODE_INVALID = 'Mã tuyến không hợp lệ';
  static readonly ROAD_CODE_TOO_LONG =
    'Mã tuyến không được vượt quá 24 ký tự';

  static readonly LENGTH_INVALID = 'Chiều dài tuyến phải là số >= 0';
  static readonly ROAD_TYPE_EMPTY = 'Loại tuyến không được để trống';
  static readonly ROAD_TYPE_INVALID = 'Loại tuyến không hợp lệ';
  static readonly ROAD_TYPE_TOO_LONG =
    'Loại tuyến không được vượt quá 50 ký tự';

  static readonly START_POINT_EMPTY = 'Điểm xuất phát không được để trống';
  static readonly START_POINT_INVALID = 'Điểm xuất phát không hợp lệ';
  static readonly START_POINT_TOO_LONG =
    'Điểm xuất phát không được vượt quá 255 ký tự';

  static readonly END_POINT_EMPTY = 'Điểm kết thúc không được để trống';
  static readonly END_POINT_INVALID = 'Điểm kết thúc không hợp lệ';
  static readonly END_POINT_TOO_LONG =
    'Điểm kết thúc không được vượt quá 255 ký tự';

  static readonly START_TIME_EMPTY = 'Giờ khởi hành không được để trống';
  static readonly START_TIME_INVALID = 'Giờ khởi hành không hợp lệ';
  static readonly START_TIME_FORMAT =
    'Giờ khởi hành phải theo định dạng HH:mm (ví dụ: 08:30)';

  static readonly END_TIME_EMPTY = 'Giờ kết thúc không được để trống';
  static readonly END_TIME_INVALID = 'Giờ kết thúc không hợp lệ';
  static readonly END_TIME_FORMAT =
    'Giờ kết thúc phải theo định dạng HH:mm (ví dụ: 14:00)';

  static readonly ROAD_STATUS_EMPTY = 'Trạng thái tuyến không được để trống';
  static readonly ROAD_STATUS_INVALID = 'Trạng thái tuyến không hợp lệ';
  static readonly ROAD_STATUS_NOT_IN =
    'Trạng thái tuyến phải là ACTIVE hoặc INACTIVE';

  static readonly ROAD_ID_INVALID = 'ID tuyến phải là số nguyên dương';
}

export class CmsRoadSuccessMessage {
  static readonly DELETE_SUCCESS = 'Đã vô hiệu hóa tuyến đường';
}
