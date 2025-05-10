import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRoleDto {
  @ApiProperty({ example: ['role-uuid-1', 'role-uuid-2'] })
  @IsNotEmpty()
  @IsArray()
  @IsUUID('4', { each: true })
  roleIds: string[];
}