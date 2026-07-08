export class BookingErrorMessage {
  static readonly BOOKING_NOT_FOUND = 'Không tìm thấy đặt chỗ';
  static readonly TICKET_NOT_FOUND = 'Không tìm thấy vé';
  static readonly TRIP_NOT_FOUND = 'Không tìm thấy chuyến xe';
  static readonly TICKET_NOT_PAID = 'Vé chưa thanh toán';
  static readonly TICKET_NOT_REFUNDABLE = 'Vé không thể hoàn tiền';
  static readonly REFUND_ALREADY_REQUESTED = 'Yêu cầu hoàn tiền đã được gửi trước đó';
  static readonly TRIP_ALREADY_DEPARTED = 'Chuyến xe đã khởi hành, không thể yêu cầu hoàn tiền';
  static readonly REFUND_REQUEST_EXPIRED = 'Yêu cầu hoàn tiền đã hết hạn';
}
