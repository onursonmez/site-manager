import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsBoolean,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventTriggerDto {
  @ApiProperty({ example: 'event-definition-uuid' })
  @IsNotEmpty()
  @IsUUID()
  eventDefinitionId: string;

  @ApiProperty({ example: 'target-collection-uuid' })
  @IsNotEmpty()
  @IsUUID()
  targetCollectionId: string;

  @ApiProperty({
    example: {
      operation: 'create',
      data: {
        status: 'active',
        role: 'user',
      },
    },
  })
  @IsNotEmpty()
  @IsObject()
  action: Record<string, any>;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}