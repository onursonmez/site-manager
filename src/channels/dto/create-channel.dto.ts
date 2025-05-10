import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsObject,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChannelDto {
  @ApiProperty({ example: 'Main Website' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Main corporate website', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'main-website', required: false })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ example: 'parent-channel-uuid', required: false })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: 'postgresql://user:pass@host:5432/db', required: false })
  @IsOptional()
  @IsString()
  connectionString?: string;

  @ApiProperty({
    example: { theme: 'dark', language: 'en' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({ example: ['collection-uuid-1'], required: false })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  collectionIds?: string[];
}