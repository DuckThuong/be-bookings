export class CompanyErrorMessage {
  static readonly COMPANY_NOT_FOUND = 'Không tìm thấy nhà xe';
  static readonly COMPANY_ID_REQUIRED = 'Cần truyền companyId';
  static readonly ROAD_NOT_FOUND = 'Không tìm thấy tuyến đường';
  static readonly TRIP_NOT_FOUND = 'Không tìm thấy chuyến xe';
  static readonly VEHICLE_NOT_FOUND = 'Không tìm thấy phương tiện';
  static readonly DRIVER_NOT_FOUND = 'Không tìm thấy tài xế';
  static readonly COMPANY_TRIP_NOT_FOUND = 'Không tìm thấy chuyến nhà xe';
  static readonly SEAT_NOT_FOUND = 'Không tìm thấy ghế';
  static readonly FORBIDDEN = 'Bạn không có quyền thao tác nhà xe này';
  static readonly COMPANY_NAME_REQUIRED = 'Tên nhà xe không được để trống';
  static readonly ROAD_NOT_BELONG_COMPANY = 'Tuyến đường không thuộc nhà xe này';
  static readonly TRIP_NOT_BELONG_COMPANY = 'Chuyến xe không thuộc nhà xe này';
  static readonly VEHICLE_NOT_BELONG_COMPANY = 'Phương tiện không thuộc nhà xe này';
  static readonly DRIVER_NOT_BELONG_COMPANY = 'Tài xế không thuộc nhà xe này';
  static readonly DRIVER_VEHICLE_MISMATCH = 'Tài xế không thuộc phương tiện của nhà xe';
  static readonly COMPANY_ALREADY_EXISTS = 'Bạn đã đăng ký nhà xe';
  static readonly CODE_CONFLICT = 'Mã đã tồn tại';
  static readonly INVALID_ROAD_ID = 'ID tuyến đường không hợp lệ';
  static readonly INVALID_REFERENCE = 'Tham chiếu dữ liệu không hợp lệ';
  static readonly TICKET_NOT_FOUND = 'Không tìm thấy vé';
  static readonly SEAT_NOT_BELONG_VEHICLE = 'Ghế không thuộc phương tiện này';
}
