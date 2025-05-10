import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignChannelUserDto {
  @ApiProperty({ example: 'user-uuid' })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({ example: 'role-uuid' })
  @IsNotEmpty()
  @IsUUID()
  roleId: string;
}