import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { RoutesService } from "./routes.service";
import { CreateRouteDto } from "./dto/create-route.dto";
import { UpdateRouteDto } from "./dto/update-route.dto";
import { ApiTags } from "@nestjs/swagger";
import { Auth } from "../auth/decorators/auth.decorators";
import { ROLES } from "../auth/constants/roles.constants";

@ApiTags("Routes")
@Controller("routes")
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Auth(ROLES.Admin)
  @Post()
  create(@Body() createRouteDto: CreateRouteDto) {
    return this.routesService.create(createRouteDto);
  }

  @Get()
  findAll() {
    return this.routesService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.routesService.findOne(id);
  }

  @Auth(ROLES.Admin)
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateRouteDto: UpdateRouteDto) {
    return this.routesService.update(id, updateRouteDto);
  }

  @Auth(ROLES.Admin)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.routesService.remove(id);
  }
}
