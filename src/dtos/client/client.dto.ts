import { ApiPropertyOptional } from '@nestjs/swagger';

export class ClientPaginationQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Trang (bắt đầu từ 1)' })
  page?: number;

  @ApiPropertyOptional({ example: 20, description: 'Số bản ghi mỗi trang (tối đa 100)' })
  limit?: number;
}

export class ClientCompanyQueryDto extends ClientPaginationQueryDto {
  @ApiPropertyOptional({ description: 'Tìm theo tên/mã/mô tả' })
  search?: string;

  @ApiPropertyOptional({ example: 'ACTIVE' })
  status?: string;
}

export class ClientRoadQueryDto extends ClientPaginationQueryDto {
  @ApiPropertyOptional({ example: 1 })
  companyId?: number;

  @ApiPropertyOptional({ description: 'Tìm theo tên/mã/điểm đi/điểm đến' })
  search?: string;

  @ApiPropertyOptional({ example: 'Hà Nội' })
  startPoint?: string;

  @ApiPropertyOptional({ example: 'Đà Nẵng' })
  endPoint?: string;

  @ApiPropertyOptional({ example: 'ACTIVE' })
  status?: string;
}

export class ClientTripQueryDto extends ClientPaginationQueryDto {
  @ApiPropertyOptional({ example: 1 })
  companyId?: number;

  @ApiPropertyOptional({ example: 1 })
  roadId?: number;

  @ApiPropertyOptional({ description: 'Tìm theo tên/mã chuyến' })
  search?: string;

  @ApiPropertyOptional({ example: 'ACTIVE' })
  status?: string;
}

export class ClientCompanyTripQueryDto extends ClientPaginationQueryDto {
  @ApiPropertyOptional({ example: 1 })
  companyId?: number;

  @ApiPropertyOptional({ example: 1 })
  tripId?: number;

  @ApiPropertyOptional({ example: 1 })
  roadId?: number;

  @ApiPropertyOptional({ example: 'ACTIVE' })
  status?: string;

  @ApiPropertyOptional({
    description: 'Chỉ lấy chuyến còn ít nhất N ghế trống',
    example: 1,
  })
  minAvailableSeats?: number;
}

export class ClientMyTicketQueryDto extends ClientPaginationQueryDto {
  @ApiPropertyOptional({
    description:
      'USER: bỏ qua (luôn của mình). ADMIN/OWNER: lọc theo khách; bỏ trống = xem tất cả trong phạm vi quyền',
  })
  customerId?: string;

  @ApiPropertyOptional({ example: 1 })
  companyId?: number;

  @ApiPropertyOptional({ example: 'PAID' })
  status?: string;

  @ApiPropertyOptional({ description: 'Tìm theo mã vé' })
  code?: string;

  @ApiPropertyOptional({ example: '2026-01-01' })
  fromDate?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  toDate?: string;
}

export class ClientMyInvoiceQueryDto extends ClientPaginationQueryDto {
  @ApiPropertyOptional({
    description:
      'USER: bỏ qua. ADMIN/OWNER: lọc theo khách; bỏ trống = xem tất cả trong phạm vi quyền',
  })
  customerId?: string;

  @ApiPropertyOptional({ example: 1 })
  companyId?: number;

  @ApiPropertyOptional({ example: 'SUCCESS' })
  status?: string;

  @ApiPropertyOptional({ example: 'MOMO' })
  method?: string;

  @ApiPropertyOptional({ description: 'Tìm theo mã hóa đơn / mã tham chiếu' })
  search?: string;

  @ApiPropertyOptional({ example: '2026-01-01' })
  fromDate?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  toDate?: string;
}

export class ClientMyBookingQueryDto extends ClientPaginationQueryDto {
  @ApiPropertyOptional({
    description:
      'USER: bỏ qua. ADMIN/OWNER: lọc theo khách; bỏ trống = xem tất cả trong phạm vi quyền',
  })
  customerId?: string;

  @ApiPropertyOptional({ example: 1 })
  companyId?: number;

  @ApiPropertyOptional({ example: 'HOLD' })
  status?: string;

  @ApiPropertyOptional({ example: '2026-01-01' })
  fromDate?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  toDate?: string;
}
