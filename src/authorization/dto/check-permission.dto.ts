import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckPermissionDto {
  @ApiProperty({ example: 'user-uuid' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ example: 'show_stocks' })
  @IsNotEmpty()
  @IsString()
  permissionName: string;

  @ApiProperty({ example: 'stocks' })
  @IsNotEmpty()
  @IsString()
  resource: string;

  @ApiProperty({
    example: { category: 'electronics', status: 'active' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  context?: Record<string, any>;
}