export class ClientErrorMessage {
  static readonly NOT_FOUND = 'Không tìm thấy dữ liệu';
  static readonly COMPANY_NOT_FOUND = 'Không tìm thấy nhà xe';
  static readonly ROAD_NOT_FOUND = 'Không tìm thấy tuyến đường';
  static readonly TRIP_NOT_FOUND = 'Không tìm thấy chuyến xe';
  static readonly COMPANY_TRIP_NOT_FOUND = 'Không tìm thấy chuyến khai thác';
  static readonly TICKET_NOT_FOUND = 'Không tìm thấy vé';
  static readonly INVOICE_NOT_FOUND = 'Không tìm thấy hóa đơn';
  static readonly BOOKING_NOT_FOUND = 'Không tìm thấy đặt chỗ';
  static readonly FORBIDDEN = 'Bạn không có quyền xem dữ liệu này';
  static readonly CUSTOMER_ID_REQUIRED = 'Thiếu mã khách hàng (customerId)';
  static readonly SEAT_IDS_REQUIRED = 'Phải chọn ít nhất một ghế';
  static readonly SEAT_NOT_AVAILABLE = 'Một hoặc nhiều ghế đã được đặt';
  static readonly NOT_ENOUGH_SEATS = 'Chuyến không còn đủ ghế trống';
  static readonly TRIP_MISMATCH = 'Chuyến mẫu không khớp chuyến khai thác';
  static readonly HOLD_VEHICLE_MISMATCH =
    'Loại xe/tầng không khớp phiên giữ chỗ';
  static readonly TICKET_NOT_OWNED = 'Vé không thuộc về bạn';
  static readonly PAYMENT_NOT_OWNED = 'Hóa đơn không thuộc về bạn';
  static readonly PROMO_INVALID = 'Mã khuyến mãi không hợp lệ';
  static readonly PROMO_MIN_ORDER = 'Đơn hàng chưa đủ điều kiện áp dụng mã';
  static readonly ADDON_NOT_FOUND = 'Dịch vụ thêm không tồn tại';
  static readonly ADDON_QTY_INVALID = 'Số lượng dịch vụ thêm không hợp lệ';
  static readonly MAX_SEATS_EXCEEDED = 'Vượt quá số ghế tối đa mỗi lần đặt';
  static readonly VIP_SEAT_NOT_SELECTABLE = 'Ghế VIP cần liên hệ nhà xe';
  static readonly HOLD_NOT_FOUND = 'Không tìm thấy phiên giữ chỗ';
  static readonly PASSENGER_REQUIRED = 'Vui lòng nhập thông tin hành khách';
  static readonly PAYMENT_METHOD_INVALID = 'Phương thức thanh toán không hợp lệ';
}
