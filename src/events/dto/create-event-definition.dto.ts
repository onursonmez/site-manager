import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EventType } from '../enums/event-type.enum';

export class CreateEventDefinitionDto {
  @ApiProperty({ example: 'UserCreatedEvent' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Triggered when a new user is created' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: EventType })
  @IsEnum(EventType)
  type: EventType;

  @ApiProperty({ example: 'collection-uuid' })
  @IsOptional()
  @IsUUID()
  collectionId?: string;

  @ApiProperty({ example: 'field-uuid' })
  @IsOptional()
  @IsUUID()
  fieldId?: string;

  @ApiProperty({
    example: {
      status: 'active',
      role: 'admin',
    },
  })
  @IsOptional()
  @IsObject()
  conditions?: Record<string, any>;

  @ApiProperty({ example: 3 })
  @IsOptional()
  @IsNumber()
  maxRetries?: number;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}