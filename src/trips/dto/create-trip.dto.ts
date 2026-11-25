import {
  IsDateString,
  Min,
  IsBoolean,
  IsOptional,
  IsUUID,
  IsInt,
  Max,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class CreateTripDto {
  @ApiProperty({ example: "uuid-of-route" })
  @IsUUID()
  routeId: string;

  @ApiProperty({ example: "2024-12-25T08:00:00.000Z" })
  @IsDateString()
  departureTime: string;

  @ApiProperty({ example: "2024-12-25T12:00:00.000Z" })
  @IsDateString()
  arrivalTime: string;

  @ApiProperty({ example: 40 })
  @Type(() => Number)
  @IsInt()
  @Max(200)
  @Min(1)
  totalSeats: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
