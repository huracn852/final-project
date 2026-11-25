import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Trip } from "./entities/trip.entity";
import { Seat } from "../seats/entities/seat.entity";
import { Route } from "../routes/entities/route.entity";
import { CreateTripDto } from "./dto/create-trip.dto";
import { UpdateTripDto } from "./dto/update-trip.dto";

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trip)
    private tripRepository: Repository<Trip>,
    @InjectRepository(Seat)
    private seatRepository: Repository<Seat>,
    @InjectRepository(Route)
    private routeRepository: Repository<Route>,
  ) {}

  async create(createTripDto: CreateTripDto) {
    const departureTime = new Date(createTripDto.departureTime);
    const arrivalTime = new Date(createTripDto.arrivalTime);
    if (arrivalTime <= departureTime) {
      throw new BadRequestException(
        "La hora de llegada debe ser posterior a la de salida",
      );
    }
    const route = await this.routeRepository.findOneBy({
      routeId: createTripDto.routeId,
    });
    if (!route)
      throw new NotFoundException(
        `Ruta ${createTripDto.routeId} no encontrada`,
      );

    const trip = this.tripRepository.create({
      route,
      departureTime,
      arrivalTime,
      totalSeats: createTripDto.totalSeats,
      isActive: createTripDto.isActive ?? true,
    });
    const savedTrip = await this.tripRepository.save(trip);

    // Auto-create seats for this trip
    const seats = Array.from({ length: createTripDto.totalSeats }, (_, i) =>
      this.seatRepository.create({
        trip: savedTrip,
        seatNumber: i + 1,
        status: "available",
      }),
    );
    await this.seatRepository.save(seats);

    return this.tripRepository.findOne({
      where: { tripId: savedTrip.tripId },
      relations: { seats: true },
    });
  }

  findAll() {
    return this.tripRepository.find({
      where: { isActive: true },
      relations: { route: true },
      order: { departureTime: "ASC" },
    });
  }

  findByRoute(routeId: string) {
    return this.tripRepository.find({
      where: { route: { routeId }, isActive: true },
      relations: { route: true, seats: true },
      order: { departureTime: "ASC" },
    });
  }

  async findOne(tripId: string) {
    const trip = await this.tripRepository.findOne({
      where: { tripId },
      relations: { route: true, seats: true },
    });
    if (!trip) throw new NotFoundException(`Viaje ${tripId} no encontrado`);
    return trip;
  }

  async update(tripId: string, updateTripDto: UpdateTripDto) {
    const trip = await this.findOne(tripId);
    const departureTime = updateTripDto.departureTime
      ? new Date(updateTripDto.departureTime)
      : trip.departureTime;
    const arrivalTime = updateTripDto.arrivalTime
      ? new Date(updateTripDto.arrivalTime)
      : trip.arrivalTime;
    if (arrivalTime <= departureTime) {
      throw new BadRequestException(
        "La hora de llegada debe ser posterior a la de salida",
      );
    }

    if (updateTripDto.routeId) {
      const route = await this.routeRepository.findOneBy({
        routeId: updateTripDto.routeId,
      });
      if (!route)
        throw new NotFoundException(
          `Ruta ${updateTripDto.routeId} no encontrada`,
        );
      trip.route = route;
    }
    Object.assign(trip, {
      departureTime,
      arrivalTime,
      ...(updateTripDto.totalSeats !== undefined && {
        totalSeats: updateTripDto.totalSeats,
      }),
      ...(updateTripDto.isActive !== undefined && {
        isActive: updateTripDto.isActive,
      }),
    });

    if (updateTripDto.totalSeats !== undefined) {
      const target = updateTripDto.totalSeats;
      const seats = await this.seatRepository.find({
        where: { trip: { tripId } },
        order: { seatNumber: "ASC" },
      });

      if (target < seats.length) {
        const removable = seats.filter((seat) => seat.seatNumber > target);
        const occupied = removable.filter(
          (seat) => seat.status !== "available",
        );
        if (occupied.length > 0) {
          throw new ConflictException(
            "No se pueden retirar asientos reservados o vendidos",
          );
        }
        await this.seatRepository.remove(removable);
      } else if (target > seats.length) {
        const existingNumbers = new Set(seats.map((seat) => seat.seatNumber));
        const toCreate = Array.from({ length: target }, (_, i) => i + 1)
          .filter((seatNumber) => !existingNumbers.has(seatNumber))
          .map((seatNumber) =>
            this.seatRepository.create({
              trip,
              seatNumber,
              status: "available",
            }),
          );
        await this.seatRepository.save(toCreate);
      }
    }

    return this.tripRepository.save(trip);
  }

  async remove(tripId: string) {
    const trip = await this.findOne(tripId);
    return this.tripRepository.remove(trip);
  }
}
