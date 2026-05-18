import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadImageDto {
  @ApiProperty({
    description: 'File image upload',
    type: 'string',
    format: 'binary',
    required: true,
  })
  @IsNotEmpty()
  file: Express.Multer.File;
}

export class CloudinaryUploadResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Upload successful',
    required: true,
  })
  message: string;

  @ApiProperty({
    description: 'Uploaded image URL',
    example: '____',
    required: true,
  })
  imageUrl: string;

  constructor(partial: Partial<CloudinaryUploadResponseDto>) {
    Object.assign(this, partial);
  }
}
