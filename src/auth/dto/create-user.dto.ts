import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({ example: "Juan Pérez" })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  userName: string;

  @ApiProperty({ example: "juan@example.com" })
  @IsEmail()
  userEmail: string;

  @ApiProperty({ example: "password123", minLength: 6 })
  @IsString()
  @MinLength(6)
  userPassword: string;
}
