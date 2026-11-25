import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Route } from "./entities/route.entity";
import { CreateRouteDto } from "./dto/create-route.dto";
import { UpdateRouteDto } from "./dto/update-route.dto";

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route)
    private routeRepository: Repository<Route>,
  ) {}

  create(createRouteDto: CreateRouteDto) {
    if (
      createRouteDto.origin.trim().toLowerCase() ===
      createRouteDto.destination.trim().toLowerCase()
    ) {
      throw new BadRequestException(
        "El origen y el destino deben ser diferentes",
      );
    }
    const route = this.routeRepository.create(createRouteDto);
    return this.routeRepository.save(route);
  }

  findAll() {
    return this.routeRepository.find({
      where: { isActive: true },
      relations: { trips: false },
    });
  }

  findAllAdmin() {
    return this.routeRepository.find({ relations: { trips: false } });
  }

  async findOne(routeId: string) {
    const route = await this.routeRepository.findOne({
      where: { routeId },
      relations: { trips: true },
    });
    if (!route) throw new NotFoundException(`Ruta ${routeId} no encontrada`);
    return route;
  }

  async update(routeId: string, updateRouteDto: UpdateRouteDto) {
    const route = await this.routeRepository.preload({
      routeId,
      ...updateRouteDto,
    });
    if (!route) throw new NotFoundException(`Ruta ${routeId} no encontrada`);
    if (
      route.origin.trim().toLowerCase() ===
      route.destination.trim().toLowerCase()
    ) {
      throw new BadRequestException(
        "El origen y el destino deben ser diferentes",
      );
    }
    return this.routeRepository.save(route);
  }

  async remove(routeId: string) {
    const route = await this.findOne(routeId);
    return this.routeRepository.remove(route);
  }
}
