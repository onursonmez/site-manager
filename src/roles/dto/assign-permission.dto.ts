import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignPermissionDto {
  @ApiProperty({ example: ['permission-uuid-1', 'permission-uuid-2'] })
  @IsNotEmpty()
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds: string[];
}