import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FieldType } from '../enums/field-type.enum';

export class CreateFieldDto {
  @ApiProperty({ example: 'title' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Post title', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: FieldType })
  @IsEnum(FieldType)
  type: FieldType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  options?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  validation?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  conditions?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isUnique?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  relatedCollectionId?: string;
}