export class SalesErrorMessage {
  static readonly BOOKING_NOT_FOUND = 'Không tìm thấy đặt chỗ';
  static readonly PAYMENT_NOT_FOUND = 'Không tìm thấy thanh toán';
  static readonly REFUND_NOT_FOUND = 'Không tìm thấy hoàn tiền';
  static readonly COMMISSION_NOT_FOUND = 'Không tìm thấy hoa hồng';
  static readonly SETTLEMENT_NOT_FOUND = 'Không tìm thấy đối soát';
  static readonly STAT_NOT_FOUND = 'Không tìm thấy thống kê';
  static readonly PROMOTION_USAGE_NOT_FOUND =
    'Không tìm thấy lịch sử khuyến mãi';
  static readonly BOOKING_EXPIRED = 'Đặt chỗ đã hết hạn';
  static readonly BOOKING_NOT_HOLD = 'Đặt chỗ không ở trạng thái giữ chỗ';
  static readonly BOOKING_ALREADY_CONVERTED = 'Đặt chỗ đã chuyển thành vé';
  static readonly PAYMENT_NOT_PENDING = 'Thanh toán không ở trạng thái chờ';
  static readonly PAYMENT_ALREADY_SUCCESS = 'Thanh toán đã thành công';
  static readonly REFUND_NOT_PENDING = 'Hoàn tiền không ở trạng thái chờ';
  static readonly TICKET_NOT_PENDING = 'Vé chưa sẵn sàng thanh toán';
  static readonly TICKET_NOT_PAID = 'Vé chưa thanh toán';
  static readonly INVALID_AMOUNT = 'Số tiền không hợp lệ';
  static readonly CUSTOMER_MISMATCH = 'Không có quyền thao tác đặt chỗ này';
}
