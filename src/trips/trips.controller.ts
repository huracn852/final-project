import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { TripsService } from "./trips.service";
import { CreateTripDto } from "./dto/create-trip.dto";
import { UpdateTripDto } from "./dto/update-trip.dto";
import { ApiTags } from "@nestjs/swagger";
import { Auth } from "../auth/decorators/auth.decorators";
import { ROLES } from "../auth/constants/roles.constants";

@ApiTags("Trips")
@Controller("trips")
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Auth(ROLES.Admin)
  @Post()
  create(@Body() createTripDto: CreateTripDto) {
    return this.tripsService.create(createTripDto);
  }

  @Get()
  findAll() {
    return this.tripsService.findAll();
  }

  @Get("by-route/:routeId")
  findByRoute(@Param("routeId") routeId: string) {
    return this.tripsService.findByRoute(routeId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.tripsService.findOne(id);
  }

  @Auth(ROLES.Admin)
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateTripDto: UpdateTripDto) {
    return this.tripsService.update(id, updateTripDto);
  }

  @Auth(ROLES.Admin)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.tripsService.remove(id);
  }
}
