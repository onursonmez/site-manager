import { IsNotEmpty, IsString, IsOptional, IsUUID, IsBoolean } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateChannelSettingsDto {
  @ApiProperty({ example: "channel-uuid" })
  channelId: string;

  @ApiProperty({ example: "theme" })
  @IsNotEmpty()
  @IsString()
  key: string;

  @ApiProperty({ example: { primary: "#000000" } })
  @IsNotEmpty()
  value: any;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isInherited?: boolean;

  @ApiProperty({ example: "parent-channel-uuid", required: false })
  @IsOptional()
  @IsUUID()
  inheritedFromId?: string;
}
