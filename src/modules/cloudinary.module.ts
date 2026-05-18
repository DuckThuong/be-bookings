import { Module } from '@nestjs/common';
import { UploadController } from '../controllers/cloudinary.controller';
import { CloudinaryService } from '../services/cloudinary.service';

@Module({
  controllers: [UploadController],
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
