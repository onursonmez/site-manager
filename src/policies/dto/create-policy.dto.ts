import { IsNotEmpty, IsObject, IsOptional, IsString, IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreatePolicyDto {
  @ApiProperty({ example: "StockViewPolicy" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: "Policy for viewing stock information", required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: {
      resource: "stocks",
      action: "read",
      conditions: {
        owner: "$user.id",
      },
    },
  })
  @IsNotEmpty()
  @IsObject()
  conditions: Record<string, any>;

  @ApiProperty({ example: "createdById = :userId", required: false })
  @IsOptional()
  @IsString()
  filterExpression?: string;

  @ApiProperty({ example: "permission-uuid" })
  @IsNotEmpty()
  @IsUUID()
  permissionId: string;
}
