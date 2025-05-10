import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'admin' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Administrator role with full access', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}