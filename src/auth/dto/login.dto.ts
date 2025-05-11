import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({ example: "johndoe@example.com" })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({ example: "Password123!" })
  @IsNotEmpty()
  @IsString()
  password: string;
}
