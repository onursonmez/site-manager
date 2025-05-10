import {
  IsNotEmpty,
  IsString,
  IsUrl,
  IsObject,
  IsOptional,
  IsBoolean,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWebhookDto {
  @ApiProperty({ example: 'Slack Notification' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'https://hooks.slack.com/services/xxx' })
  @IsNotEmpty()
  @IsUrl()
  url: string;

  @ApiProperty({
    example: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer xxx',
    },
  })
  @IsOptional()
  @IsObject()
  headers?: Record<string, any>;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: 'event-definition-uuid' })
  @IsNotEmpty()
  @IsUUID()
  eventDefinitionId: string;
}