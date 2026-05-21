import { Module } from '@nestjs/common';
import { CMSVerhicalController } from '../../controllers/CMS/CMS_verhical.controller';
import { CMSVerhicalService } from '../../services/CMS/CMS_verhical.service';

@Module({
  controllers: [CMSVerhicalController],
  providers: [CMSVerhicalService],
  exports: [CMSVerhicalService],
})
export class CMSVerhicalModule {}
