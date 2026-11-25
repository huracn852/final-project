import { IsEmail, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginUserDto {
  @ApiProperty({ example: "juan@example.com" })
  @IsEmail()
  userEmail: string;

  @ApiProperty({ example: "password123" })
  @IsString()
  userPassword: string;
}
