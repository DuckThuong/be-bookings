import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/jwt/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../dtos/user/common.dto';
import { ClientCatalogService } from '../../services/client-catalog.service';
import {
  ClientCompanyQueryDto,
  ClientCompanyTripQueryDto,
  ClientRoadQueryDto,
  ClientTripQueryDto,
} from '../../dtos/client/client.dto';

/** Flow tra cứu: nhà xe, tuyến, chuyến (chỉ đọc) */
@ApiTags('Client - Catalog')
@Controller('client/catalog')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ClientCatalogController {
  constructor(private readonly catalogService: ClientCatalogService) {}

  @Get('companies')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Danh sách nhà xe' })
  listCompanies(@Query() query: ClientCompanyQueryDto) {
    return this.catalogService.listCompanies(query);
  }

  @Get('companies/:id')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Chi tiết nhà xe' })
  getCompany(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.getCompany(id);
  }

  @Get('roads')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Danh sách tuyến / quãng đường' })
  listRoads(@Query() query: ClientRoadQueryDto) {
    return this.catalogService.listRoads(query);
  }

  @Get('roads/:id')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Chi tiết tuyến' })
  getRoad(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.getRoad(id);
  }

  @Get('trips')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Danh sách chuyến' })
  listTrips(@Query() query: ClientTripQueryDto) {
    return this.catalogService.listTrips(query);
  }

  @Get('trips/:id')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Chi tiết chuyến' })
  getTrip(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.getTrip(id);
  }

  @Get('company-trips')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Chuyến khai thác (lịch chạy thực tế)' })
  listCompanyTrips(@Query() query: ClientCompanyTripQueryDto) {
    return this.catalogService.listCompanyTrips(query);
  }

  @Get('company-trips/:id')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Chi tiết chuyến khai thác' })
  getCompanyTrip(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.getCompanyTrip(id);
  }
}
