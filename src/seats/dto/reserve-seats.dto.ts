import { IsArray, IsString, ArrayMinSize, ArrayUnique } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ReserveSeatsDto {
  @ApiProperty({ example: ["uuid-seat-1", "uuid-seat-2"] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsString({ each: true })
  seatIds: string[];
}
