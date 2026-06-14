/** Thông báo validate cho CMS tạo / cập nhật chuyến mẫu */
export class CmsTripValidationMessage {
  static readonly TRIP_CODE_INVALID = 'Mã chuyến không hợp lệ';
  static readonly TRIP_CODE_TOO_LONG = 'Mã chuyến không được vượt quá 24 ký tự';

  static readonly ROUTE_EMPTY = 'Tuyến (route) không được để trống';
  static readonly ROUTE_INVALID = 'Tuyến (route) không hợp lệ';
  static readonly ROUTE_TOO_LONG = 'Tuyến không được vượt quá 255 ký tự';
  static readonly ROUTE_NOT_FOUND =
    'Không tìm thấy tuyến theo mã hoặc tên đã nhập';
  static readonly ROUTE_NOT_BELONG_COMPANY = 'Tuyến không thuộc nhà xe của bạn';
  static readonly ROAD_INACTIVE = 'Tuyến đang không hoạt động';

  static readonly VEHICLE_EMPTY = 'Mã xe (vehicle) không được để trống';
  static readonly VEHICLE_INVALID = 'Mã xe không hợp lệ';
  static readonly VEHICLE_TOO_LONG = 'Mã xe không được vượt quá 50 ký tự';
  static readonly VEHICLE_NOT_FOUND = 'Không tìm thấy xe theo mã đã nhập';
  static readonly VEHICLE_NOT_BELONG_COMPANY = 'Xe không thuộc nhà xe của bạn';
  static readonly VEHICLE_INACTIVE = 'Xe đang không hoạt động';

  static readonly DRIVER_EMPTY = 'Mã tài xế (driver) không được để trống';
  static readonly DRIVER_INVALID = 'Mã tài xế không hợp lệ';
  static readonly DRIVER_TOO_LONG = 'Mã tài xế không được vượt quá 24 ký tự';
  static readonly DRIVER_NOT_FOUND = 'Không tìm thấy tài xế theo mã đã nhập';
  static readonly DRIVER_NOT_BELONG_COMPANY =
    'Tài xế không thuộc nhà xe của bạn';
  static readonly DRIVER_INACTIVE = 'Tài xế đang không hoạt động';

  static readonly DEPARTURE_EMPTY = 'Giờ khởi hành không được để trống';
  static readonly DEPARTURE_INVALID = 'Giờ khởi hành không hợp lệ';
  static readonly DEPARTURE_TOO_LONG =
    'Giờ khởi hành không được vượt quá 50 ký tự';

  static readonly ARRIVAL_EMPTY = 'Giờ đến không được để trống';
  static readonly ARRIVAL_INVALID = 'Giờ đến không hợp lệ';
  static readonly ARRIVAL_TOO_LONG = 'Giờ đến không được vượt quá 50 ký tự';

  static readonly BOOKED_SEATS_INVALID = 'Số ghế đã đặt phải là số nguyên >= 0';

  static readonly CAPACITY_INVALID = 'Sức chứa phải là số nguyên > 0';

  static readonly BOOKED_EXCEEDS_CAPACITY =
    'Số ghế đã đặt không được lớn hơn sức chứa';

  static readonly OCCUPANCY_RATE_INVALID = 'Tỉ lệ lấp đầy phải từ 0 đến 100';

  static readonly OCCUPANCY_RATE_MISMATCH =
    'Tỉ lệ lấp đầy không khớp với số ghế đã đặt và sức chứa';

  static readonly TRIP_STATUS_EMPTY = 'Trạng thái chuyến không được để trống';
  static readonly TRIP_STATUS_INVALID = 'Trạng thái chuyến không hợp lệ';
  static readonly TRIP_STATUS_NOT_IN =
    'Trạng thái chuyến phải là đang hoạt động hoặc ngừng hoạt động';

  static readonly NOTE_INVALID = 'Ghi chú không hợp lệ';
  static readonly NOTE_TOO_LONG = 'Ghi chú không được vượt quá 500 ký tự';

  static readonly TRIP_ID_INVALID = 'ID chuyến phải là số nguyên dương';

  static readonly COMPANY_TRIP_SYNC_FAILED = 'Không thể đồng bộ chuyến';
}

export class CmsTripSuccessMessage {
  static readonly DELETE_SUCCESS = 'Đã vô hiệu hóa chuyến mẫu';
}
