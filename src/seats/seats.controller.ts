import { Controller, Get, Post, Body, Param, Delete } from "@nestjs/common";
import { SeatsService } from "./seats.service";
import { ReserveSeatsDto } from "./dto/reserve-seats.dto";
import { ApiTags } from "@nestjs/swagger";
import { Auth } from "../auth/decorators/auth.decorators";
import { CurrentUser } from "../auth/decorators/user.decorators";
import { ROLES } from "../auth/constants/roles.constants";

@ApiTags("Seats")
@Controller("seats")
export class SeatsController {
  constructor(private readonly seatsService: SeatsService) {}

  @Get("trip/:tripId")
  findByTrip(@Param("tripId") tripId: string) {
    return this.seatsService.findByTrip(tripId);
  }

  @Auth()
  @Post("reserve")
  reserveSeats(
    @Body() reserveSeatsDto: ReserveSeatsDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.seatsService.reserveSeats(reserveSeatsDto, user.userId);
  }

  @Auth()
  @Delete("release")
  releaseReservation(
    @Body() body: { seatIds: string[] },
    @CurrentUser() user: { userId: string },
  ) {
    return this.seatsService.releaseReservation(body.seatIds, user.userId);
  }

  @Auth(ROLES.Admin)
  @Post("cleanup")
  cleanExpired() {
    return this.seatsService.cleanExpiredReservations();
  }
}
