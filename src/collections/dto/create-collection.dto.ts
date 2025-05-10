import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateFieldDto } from './create-field.dto';

export class CreateCollectionDto {
  @ApiProperty({ example: 'blog_posts' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Blog posts collection', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [CreateFieldDto], required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateFieldDto)
  fields?: CreateFieldDto[];
}