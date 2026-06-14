/** Thông báo validate cho CMS tạo / cập nhật tuyến đường */
export class CmsRoadValidationMessage {
  static readonly NO_PERMISSION = 'Bạn không có quyền thao tác';
  static readonly ROAD_NAME_EMPTY = 'Tên tuyến không được để trống';
  static readonly ROAD_NAME_INVALID = 'Tên tuyến không hợp lệ';
  static readonly ROAD_NAME_TOO_LONG =
    'Tên tuyến không được vượt quá 255 ký tự';

  static readonly ROAD_CODE_INVALID = 'Mã tuyến không hợp lệ';
  static readonly ROAD_CODE_TOO_LONG = 'Mã tuyến không được vượt quá 24 ký tự';

  static readonly LENGTH_INVALID = 'Chiều dài tuyến phải là số >= 0';
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
    'Trạng thái tuyến phải là đang hoạt động hoặc ngừng hoạt động';

  static readonly ROAD_ID_INVALID = 'ID tuyến phải là số nguyên dương';

  static readonly ROUTE_EMPTY = 'Tên tuyến không được để trống';
  static readonly ROUTE_INVALID = 'Tên tuyến không hợp lệ';
  static readonly ROUTE_TOO_LONG = 'Tên tuyến không được vượt quá 255 ký tự';

  static readonly DISTANCE_KM_INVALID = 'Khoảng cách phải là số >= 0';

  static readonly STANDARD_DURATION_EMPTY =
    'Thời gian di chuyển không được để trống';
  static readonly STANDARD_DURATION_INVALID =
    'Thời gian di chuyển không hợp lệ';
  static readonly STANDARD_DURATION_TOO_LONG =
    'Thời gian di chuyển không được vượt quá 50 ký tự';

  static readonly TRIPS_PER_DAY_INVALID =
    'Số chuyến mỗi ngày phải là số nguyên >= 0';

  static readonly AVERAGE_OCCUPANCY_INVALID = 'Tỉ lệ lấp đầy phải từ 0 đến 100';

  static readonly ESTIMATED_REVENUE_INVALID =
    'Doanh thu ước tính phải là số >= 0';

  static readonly LEAD_VEHICLE_INVALID = 'Xe chủ lực không hợp lệ';
  static readonly LEAD_VEHICLE_TOO_LONG =
    'Xe chủ lực không được vượt quá 255 ký tự';

  static readonly DEMAND_LEVEL_INVALID = 'Mức nhu cầu không hợp lệ';
  static readonly DEMAND_LEVEL_TOO_LONG =
    'Mức nhu cầu không được vượt quá 50 ký tự';

  static readonly NOTE_INVALID = 'Ghi chú không hợp lệ';
  static readonly NOTE_TOO_LONG = 'Ghi chú không được vượt quá 500 ký tự';
}

export class CmsRoadSuccessMessage {
  static readonly DELETE_SUCCESS = 'Đã vô hiệu hóa tuyến đường';
}
