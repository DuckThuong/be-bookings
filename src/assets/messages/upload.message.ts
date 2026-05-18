export class SuccessUploadMessage {
  static readonly IMAGE_UPLOADED = 'Tải ảnh lên thành công';
  static readonly FILE_PROCESSED = 'Tệp đã được xử lý thành công';
  static readonly UPLOAD_COMPLETED = 'Hoàn tất tải lên';
}

export class ErrorUploadMessage {
  static readonly FILE_REQUIRED = 'Vui lòng chọn tệp để tải lên';
  static readonly FILE_BUFFER_MISSING = 'Không tìm thấy dữ liệu tệp';
  static readonly UPLOAD_FAILED = 'Tải ảnh lên Cloudinary thất bại';
  static readonly INVALID_FILE_TYPE = 'Định dạng tệp không hợp lệ';
  static readonly FILE_TOO_LARGE = 'Kích thước tệp vượt quá giới hạn cho phép';
  static readonly CLOUDINARY_ERROR = 'Lỗi dịch vụ Cloudinary';
  static readonly NETWORK_ERROR = 'Đã xảy ra lỗi mạng trong quá trình tải lên';
}
