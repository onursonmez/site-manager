import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PermissionScope } from '../enums/permission-scope.enum';

export class CreatePermissionDto {
  @ApiProperty({ example: 'show_stocks' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Permission to view stock information', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: PermissionScope, example: PermissionScope.ALL, default: PermissionScope.ALL })
  @IsEnum(PermissionScope)
  @IsOptional()
  scope?: PermissionScope = PermissionScope.ALL;

  @ApiProperty({ example: 'stocks', required: false })
  @IsOptional()
  @IsString()
  resource?: string;

  @ApiProperty({ example: 'read', required: false })
  @IsOptional()
  @IsString()
  action?: string;
}