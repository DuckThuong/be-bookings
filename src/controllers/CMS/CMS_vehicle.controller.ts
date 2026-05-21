import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/jwt/jwt.guard';
import { CMSVehicleService } from '../../services/CMS/CMS_vehicle.service';

@ApiTags('CMS - Vehicle')
@Controller('cms/vehicle')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CMSVehicleController {
  constructor(private readonly cmsVehicleService: CMSVehicleService) {}
}
