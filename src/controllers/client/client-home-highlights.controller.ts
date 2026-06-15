import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ClientHomeHighlightsQueryDto,
  ClientHomeHighlightsResponseDto,
} from '../../dtos/client/home-highlights.dto';
import { ClientHomeHighlightsService } from '../../services/client/client-home-highlights.service';

@ApiTags('Client - Home')
@Controller('api/home')
export class ClientHomeHighlightsController {
  constructor(
    private readonly highlightsService: ClientHomeHighlightsService,
  ) {}

  @Get('highlights')
  @ApiOperation({
    summary: 'Lấy dữ liệu nổi bật cho trang chủ (FE Home)',
    description:
      'Trả về danh sách nhà xe nổi bật (OPERATOR) hoặc chuyến xe được đặt nhiều nhất (TRIP) dựa trên số vé PAID. Truyền `type` để chọn loại dữ liệu.',
  })
  getHighlights(
    @Query() query: ClientHomeHighlightsQueryDto,
  ): Promise<ClientHomeHighlightsResponseDto> {
    return this.highlightsService.getHighlights(query);
  }
}
