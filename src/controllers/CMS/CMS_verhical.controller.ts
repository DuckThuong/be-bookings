import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/jwt/jwt.guard';
import { CMSVerhicalService } from '../../services/CMS/CMS_verhical.service';

@ApiTags('CMS - Verhical')
@Controller('cms/verhical')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CMSVerhicalController {
  constructor(private readonly cmsVerhicalService: CMSVerhicalService) {}
}
