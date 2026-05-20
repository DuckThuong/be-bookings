import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/jwt/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  UserDecoratorDtoResponse,
  UserRole,
} from '../dtos/user/common.dto';
import { User } from '../user.decorator';
import { CompanyService } from '../services/company.service';
import {
  CreateCompanyDto,
  CreateCompanyTripDto,
  CreateDriverDto,
  CreateRoadDto,
  CreateSeatDto,
  CreateSeatsBatchDto,
  CreateTripDto,
  CreateVehicleDto,
  UpdateCompanyDto,
  UpdateCompanyTripDto,
  UpdateDriverDto,
  UpdateRoadDto,
  UpdateTripDto,
  UpdateVehicleDto,
} from '../dtos/company/company.dto';

@ApiTags('Company')
@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.OWNER)
@ApiBearerAuth('JWT-auth')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  // ---------- Company ----------

  @Post()
  @ApiOperation({ summary: 'Đăng ký nhà xe' })
  createCompany(
    @User() user: UserDecoratorDtoResponse,
    @Body() payload: CreateCompanyDto,
  ) {
    return this.companyService.createCompany(user, payload);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách nhà xe (Admin: tất cả, Owner: của mình)' })
  getCompanies(@User() user: UserDecoratorDtoResponse) {
    return this.companyService.getCompanies(user);
  }

  @Get('my')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: '[Owner] Nhà xe của tôi' })
  getMyCompany(@User() user: UserDecoratorDtoResponse) {
    return this.companyService.getMyCompany(user);
  }

  @Get(':companyId')
  @ApiOperation({ summary: 'Chi tiết nhà xe' })
  getCompany(
    @User() user: UserDecoratorDtoResponse,
    @Param('companyId', ParseIntPipe) companyId: number,
  ) {
    return this.companyService.getCompanyById(user, companyId);
  }

  @Get(':companyId/overview')
  @ApiOperation({ summary: 'Tổng quan doanh số / tài nguyên nhà xe' })
  getOverview(
    @User() user: UserDecoratorDtoResponse,
    @Param('companyId', ParseIntPipe) companyId: number,
  ) {
    return this.companyService.getCompanyOverview(user, companyId);
  }

  @Patch(':companyId')
  @ApiOperation({ summary: 'Cập nhật nhà xe' })
  updateCompany(
    @User() user: UserDecoratorDtoResponse,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Body() payload: UpdateCompanyDto,
  ) {
    return this.companyService.updateCompany(user, companyId, payload);
  }

  @Delete(':companyId')
  @ApiOperation({ summary: 'Vô hiệu hóa nhà xe' })
  deleteCompany(
    @User() user: UserDecoratorDtoResponse,
    @Param('companyId', ParseIntPipe) companyId: number,
  ) {
    return this.companyService.deleteCompany(user, companyId);
  }

  // ---------- Road ----------

  @Post(':companyId/roads')
  @ApiOperation({ summary: 'Đăng ký tuyến đường' })
  createRoad(
    @User() user: UserDecoratorDtoResponse,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Body() payload: CreateRoadDto,
  ) {
    return this.companyService.createRoad(user, companyId, payload);
  }

  @Get(':companyId/roads')
  @ApiOperation({ summary: 'Danh sách tuyến đường' })
  getRoads(
    @User() user: UserDecoratorDtoResponse,
    @Param('companyId', ParseIntPipe) companyId: number,
  ) {
    return this.companyService.getRoads(user, companyId);
  }

  @Get(':companyId/roads/:roadId')
  @ApiOperation({ summary: 'Chi tiết tuyến đường' })
  getRoad(
    @User() user: UserDecoratorDtoResponse,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Param('roadId', ParseIntPipe) roadId: number,
  ) {
    return this.companyService.getRoadById(user, companyId, roadId);
  }

  @Patch(':companyId/roads/:roadId')
  @ApiOperation({ summary: 'Cập nhật tuyến đường' })
  updateRoad(
    @User() user: UserDecoratorDtoResponse,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Param('roadId', ParseIntPipe) roadId: number,
    @Body() payload: UpdateRoadDto,
  ) {
    return this.companyService.updateRoad(user, companyId, roadId, payload);
  }

  @Delete(':companyId/roads/:roadId')
  @ApiOperation({ summary: 'Vô hiệu hóa tuyến đường' })
  deleteRoad(
    @User() user: UserDecoratorDtoResponse,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Param('roadId', ParseIntPipe) roadId: number,
  ) {
    return this.companyService.deleteRoad(user, companyId, roadId);
  }

  // ---------- Trip (mẫu chuyến) ----------

  @Post(':companyId/trips')
  @ApiOperation({ summary: 'Đăng ký chuyến xe (mẫu, gắn tuyến)' })
  createTrip(
    @User() user: UserDecoratorDtoResponse,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Body() payload: CreateTripDto,
  ) {
    return this.companyService.createTrip(user, companyId, payload);
  }

  @Get(':companyId/trips')
  @ApiOperation({ summary: 'Danh sách chuyến xe mẫu' })
  getTrips(
    @User() user: UserDecoratorDtoResponse,
    @Param('companyId', ParseIntPipe) companyId: number,
  ) {
    return this.companyService.getTrips(user, companyId);
  }

  @Get(':companyId/trips/:tripId')
  @ApiOperation({ summary: 'Chi tiết chuyến xe mẫu' })
  getTrip(
    @User() user: UserDecoratorDtoResponse,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Param('tripId', ParseIntPipe) tripId: number,
  ) {
    return this.companyService.getTripById(user, companyId, tripId);
  }

  @Patch(':companyId/trips/:tripId')
  @ApiOperation({ summary: 'Cập nhật chuyến xe mẫu' })
  updateTrip(
    @User() user: UserDecoratorDtoResponse,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Param('tripId', ParseIntPipe) tripId: number,
    @Body() payload: UpdateTripDto,
  ) {
    return this.companyService.updateTrip(user, companyId, tripId, payload);
  }

  @Delete(':companyId/trips/:tripId')
  @ApiOperation({ summary: 'Vô hiệu hóa chuyến xe mẫu' })
  deleteTrip(
    @User() user: UserDecoratorDtoResponse,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Param('tripId', ParseIntPipe) tripId: number,
  ) {
    return this.companyService.deleteTrip(user, companyId, tripId);
  }

  // ---------- Vehicle ----------

  @Post(':companyId/vehicles')
  @ApiOperation({ summary: 'Đăng ký phương tiện' })
  createVehicle(
    @User() user: UserDecoratorDtoResponse,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Body() payload: CreateVehicleDto,
  ) {
    return this.companyService.createVehicle(user, companyId, payload);
  }

  @Get(':companyId/vehicles')
  @ApiOperation({ summary: 'Danh sách phương tiện' })
  getVehicles(
    @User() user: UserDecoratorDtoResponse,
    @Param('companyId', ParseIntPipe) companyId: number,
  ) {
    return this.companyService.getVehicles(user, companyId);
  }

  @Get(':companyId/vehicles/:vehicleId')
  @ApiOperation({ summary: 'Chi tiết phương tiện' })
  getVehicle(
    @User() user: UserDecoratorDtoResponse,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
  ) {
    return this.companyService.getVehicleById(user, companyId, vehicleId);
  }

  @Patch(':companyId/vehicles/:vehicleId')
  @ApiOperation({ summary: 'Cập nhật phương tiện' })
  updateVehicle(
    @User() user: UserDecoratorDtoResponse,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
    @Body() payload: UpdateVehicleDto,
  ) {
    return this.companyService.updateVehicle(
      user,
      companyId,
      vehicleId,
      payload,
    );
  }

  @Delete(':companyId/vehicles/:vehicleId')
  @ApiOperation({ summary: 'Vô hiệu hóa phương tiện' })
  deleteVehicle(
    @User() user: UserDecoratorDtoResponse,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
  ) {
    return this.companyService.deleteVehicle(user, companyId, vehicleId);
  }

  // ---------- Seat ----------

  @Post(':companyId/vehicles/:vehicleId/seats')
  @ApiOperation({ summary: 'Đăng ký một ghế' })
  createSeat(
    @User() user: UserDecoratorDtoResponse,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
    @Body() payload: CreateSeatDto,
  ) {
    return this.companyService.createSeat(
      user,
      companyId,
      vehicleId,
      payload,
    );
  }

  @Post(':companyId/vehicles/:vehicleId/seats/batch')
  @ApiOperation({ summary: 'Đăng ký nhiều ghế (layout xe)' })
  createSeatsBatch(
    @User() user: UserDecoratorDtoResponse,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
    @Body() payload: CreateSeatsBatchDto,
  ) {
    return this.companyService.createSeatsBatch(
      user,
      companyId,
      vehicleId,
      payload,
    );
  }

  @Get(':companyId/vehicles/:vehicleId/seats')
  @ApiOperation({ summary: 'Danh sách ghế trên xe' })
  getSeats(
    @User() user: UserDecoratorDtoResponse,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
  ) {
    return this.companyService.getSeats(user, companyId, vehicleId);
  }

  // ---------- Driver ----------

  @Post(':companyId/drivers')
  @ApiOperation({ summary: 'Đăng ký tài xế' })
  createDriver(
    @User() user: UserDecoratorDtoResponse,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Body() payload: CreateDriverDto,
  ) {
    return this.companyService.createDriver(user, companyId, payload);
  }

  @Get(':companyId/drivers')
  @ApiOperation({ summary: 'Danh sách tài xế' })
  getDrivers(
    @User() user: UserDecoratorDtoResponse,
    @Param('companyId', ParseIntPipe) companyId: number,
  ) {
    return this.companyService.getDrivers(user, companyId);
  }

  @Get(':companyId/drivers/:driverId')
  @ApiOperation({ summary: 'Chi tiết tài xế' })
  getDriver(
    @User() user: UserDecoratorDtoResponse,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Param('driverId', ParseIntPipe) driverId: number,
  ) {
    return this.companyService.getDriverById(user, companyId, driverId);
  }

  @Patch(':companyId/drivers/:driverId')
  @ApiOperation({ summary: 'Cập nhật tài xế' })
  updateDriver(
    @User() user: UserDecoratorDtoResponse,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Param('driverId', ParseIntPipe) driverId: number,
    @Body() payload: UpdateDriverDto,
  ) {
    return this.companyService.updateDriver(user, companyId, driverId, payload);
  }

  @Delete(':companyId/drivers/:driverId')
  @ApiOperation({ summary: 'Vô hiệu hóa tài xế' })
  deleteDriver(
    @User() user: UserDecoratorDtoResponse,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Param('driverId', ParseIntPipe) driverId: number,
  ) {
    return this.companyService.deleteDriver(user, companyId, driverId);
  }

  // ---------- Company trip (khai thác) ----------

  @Post(':companyId/company-trips')
  @ApiOperation({
    summary: 'Đăng ký chuyến khai thác (gắn chuyến mẫu + xe + tài xế + giá)',
  })
  createCompanyTrip(
    @User() user: UserDecoratorDtoResponse,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Body() payload: CreateCompanyTripDto,
  ) {
    return this.companyService.createCompanyTrip(user, companyId, payload);
  }

  @Get(':companyId/company-trips')
  @ApiOperation({ summary: 'Danh sách chuyến khai thác' })
  getCompanyTrips(
    @User() user: UserDecoratorDtoResponse,
    @Param('companyId', ParseIntPipe) companyId: number,
  ) {
    return this.companyService.getCompanyTrips(user, companyId);
  }

  @Get(':companyId/company-trips/:companyTripId')
  @ApiOperation({ summary: 'Chi tiết chuyến khai thác' })
  getCompanyTrip(
    @User() user: UserDecoratorDtoResponse,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Param('companyTripId', ParseIntPipe) companyTripId: number,
  ) {
    return this.companyService.getCompanyTripById(
      user,
      companyId,
      companyTripId,
    );
  }

  @Patch(':companyId/company-trips/:companyTripId')
  @ApiOperation({ summary: 'Cập nhật chuyến khai thác' })
  updateCompanyTrip(
    @User() user: UserDecoratorDtoResponse,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Param('companyTripId', ParseIntPipe) companyTripId: number,
    @Body() payload: UpdateCompanyTripDto,
  ) {
    return this.companyService.updateCompanyTrip(
      user,
      companyId,
      companyTripId,
      payload,
    );
  }

  @Delete(':companyId/company-trips/:companyTripId')
  @ApiOperation({ summary: 'Vô hiệu hóa chuyến khai thác' })
  deleteCompanyTrip(
    @User() user: UserDecoratorDtoResponse,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Param('companyTripId', ParseIntPipe) companyTripId: number,
  ) {
    return this.companyService.deleteCompanyTrip(
      user,
      companyId,
      companyTripId,
    );
  }
}
