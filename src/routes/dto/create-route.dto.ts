import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  IsNotEmpty,
  MaxLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class CreateRouteDto {
  @ApiProperty({ example: "Oaxaca" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  origin: string;

  @ApiProperty({ example: "Puebla" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  destination: string;

  @ApiProperty({ example: 350.0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 240, description: "Duration in minutes" })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  durationMinutes: number;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
