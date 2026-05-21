/** Thông báo validate cho CMS tạo / cập nhật phương tiện */
export class CmsVehicalValidationMessage {
  static readonly VEHICAL_NAME_EMPTY = 'Tên phương tiện không được để trống';
  static readonly VEHICAL_NAME_INVALID = 'Tên phương tiện không hợp lệ';
  static readonly VEHICAL_NAME_TOO_LONG =
    'Tên phương tiện không được vượt quá 255 ký tự';

  static readonly VEHICAL_CODE_EMPTY = 'Mã phương tiện không được để trống';
  static readonly VEHICAL_CODE_INVALID = 'Mã phương tiện không hợp lệ';
  static readonly VEHICAL_CODE_TOO_LONG =
    'Mã phương tiện không được vượt quá 50 ký tự';

  static readonly SEAT_TYPE_EMPTY = 'Loại ghế không được để trống';
  static readonly SEAT_TYPE_INVALID = 'Loại ghế không hợp lệ';
  static readonly SEAT_TYPE_TOO_LONG =
    'Loại ghế không được vượt quá 50 ký tự';

  static readonly SEAT_COUNT_EMPTY = 'Số lượng ghế không được để trống';
  static readonly SEAT_COUNT_INVALID = 'Số lượng ghế phải là số nguyên';
  static readonly SEAT_COUNT_MIN = 'Số lượng ghế phải lớn hơn 0';
  static readonly SEAT_COUNT_MAX = 'Số lượng ghế không được vượt quá 100';

  static readonly VEHICAL_TYPE_EMPTY = 'Loại phương tiện không được để trống';
  static readonly VEHICAL_TYPE_INVALID = 'Loại phương tiện không hợp lệ';
  static readonly VEHICAL_TYPE_TOO_LONG =
    'Loại phương tiện không được vượt quá 50 ký tự';

  static readonly VEHICAL_STATUS_EMPTY =
    'Trạng thái phương tiện không được để trống';
  static readonly VEHICAL_STATUS_INVALID = 'Trạng thái phương tiện không hợp lệ';
  static readonly VEHICAL_STATUS_NOT_IN =
    'Trạng thái phương tiện phải là ACTIVE hoặc INACTIVE';

  static readonly TRIP_ID_EMPTY = 'ID chuyến mẫu (tripId) không được để trống';
  static readonly TRIP_ID_INVALID = 'ID chuyến mẫu (tripId) phải là số nguyên dương';

  static readonly DRIVER_ID_EMPTY = 'ID tài xế không được để trống';
  static readonly DRIVER_ID_INVALID = 'ID tài xế phải là số nguyên dương';

  static readonly PRICE_PER_SEAT_INVALID = 'Giá mỗi ghế phải là số >= 0';
  static readonly COMPANY_ID_INVALID = 'ID nhà xe phải là số nguyên dương';
  static readonly COMPANY_TRIP_ID_INVALID = 'ID chuyến khai thác không hợp lệ';

  static readonly SCHEDULE_EMPTY = 'Lịch trình không được để trống';
  static readonly SCHEDULE_INVALID = 'Lịch trình không hợp lệ';
  static readonly SCHEDULE_TOO_LONG =
    'Lịch trình không được vượt quá 255 ký tự';

  static readonly DESCRIPTION_EMPTY = 'Mô tả không được để trống';
  static readonly DESCRIPTION_INVALID = 'Mô tả không hợp lệ';

  static readonly TIME_START_EMPTY = 'Giờ khởi hành không được để trống';
  static readonly TIME_START_INVALID = 'Giờ khởi hành không hợp lệ';
  static readonly TIME_START_FORMAT =
    'Giờ khởi hành phải theo định dạng HH:mm (ví dụ: 08:30)';

  static readonly TIME_END_EMPTY = 'Giờ đến không được để trống';
  static readonly TIME_END_INVALID = 'Giờ đến không hợp lệ';
  static readonly TIME_END_FORMAT =
    'Giờ đến phải theo định dạng HH:mm (ví dụ: 14:00)';
}

export class CmsVehicalErrorMessage {
  static readonly CREATE_FAILED = 'Tạo phương tiện thất bại';
  static readonly UPDATE_FAILED = 'Cập nhật phương tiện thất bại';
  static readonly NOT_FOUND = 'Không tìm thấy phương tiện';
  static readonly CODE_ALREADY_EXISTS = 'Mã phương tiện đã tồn tại';
  static readonly COMPANY_TRIP_NOT_FOUND = 'Không tìm thấy chuyến khai thác';
  static readonly SEAT_BOOKED_EXCEEDS_TOTAL =
    'Không thể giảm số ghế: đã có vé đặt vượt quá số ghế mới';
}

export class CmsVehicalSuccessMessage {
  static readonly CREATE_SUCCESS = 'Tạo phương tiện thành công';
  static readonly UPDATE_SUCCESS = 'Cập nhật phương tiện thành công';
  static readonly DELETE_SUCCESS =
    'Đã xóa phương tiện, vô hiệu hóa ghế và chuyến khai thác liên kết';
}
