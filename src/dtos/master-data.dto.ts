import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class MasterDataDtoPayload {
  @ApiProperty({
    example: 'OPERATOR',
    description: 'Loại dữ liệu',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({
    example: 'code',
    description: 'Mã dữ liệu',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  code?: string;
}

export class MasterDataDtoResponse {
  @ApiProperty({
    example: 'id',
    description: 'ID dữ liệu',
    required: true,
    type: Number,
  })
  id: number;

  @ApiProperty({
    example: 'name',
    description: 'Tên dữ liệu',
    required: true,
    type: String,
  })
  name: string;

  @ApiProperty({
    example: 'rule',
    description: 'Quy tắc/giá trị bổ sung',
    required: true,
    type: String,
  })
  rule: string;

  @ApiProperty({
    example: 0,
    description: 'Thứ tự sắp xếp',
    required: true,
    type: Number,
  })
  sort: number;

  @ApiProperty({
    example: 'type',
    description: 'Loại dữ liệu',
    required: true,
    type: String,
  })
  type: string;

  @ApiProperty({
    example: 'code',
    description: 'Mã dữ liệu',
    required: true,
    type: String,
  })
  code: string;
}
