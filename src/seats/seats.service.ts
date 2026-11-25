import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Seat } from "./entities/seat.entity";
import { ReserveSeatsDto } from "./dto/reserve-seats.dto";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class SeatsService implements OnModuleInit, OnModuleDestroy {
  private readonly lockTtlSeconds: number;
  private cleanupTimer?: ReturnType<typeof setInterval>;

  constructor(
    @InjectRepository(Seat)
    private seatRepository: Repository<Seat>,
    private configService: ConfigService,
  ) {
    this.lockTtlSeconds = Number(
      this.configService.get<string>("SEAT_LOCK_TTL_SECONDS") ?? "300",
    );
  }

  onModuleInit() {
    this.cleanupTimer = setInterval(() => {
      void this.cleanExpiredReservations();
    }, 30_000);
  }

  onModuleDestroy() {
    if (this.cleanupTimer) clearInterval(this.cleanupTimer);
  }

  findByTrip(tripId: string) {
    return this.seatRepository.find({
      where: { trip: { tripId } },
      order: { seatNumber: "ASC" },
    });
  }

  /**
   * Temporarily reserve seats for a user (mutex via DB transaction + row locking).
   * Returns the reserved seats. The reservation expires after SEAT_LOCK_TTL_SECONDS.
   */
  async reserveSeats(reserveSeatsDto: ReserveSeatsDto, userId: string) {
    const { seatIds } = reserveSeatsDto;
    const now = new Date();
    const reservedUntil = new Date(now.getTime() + this.lockTtlSeconds * 1000);

    return this.seatRepository.manager.transaction(async (entityManager) => {
      const seats = await entityManager.getRepository(Seat).find({
        where: { seatId: In(seatIds) },
        lock: { mode: "pessimistic_write" },
      });

      if (seats.length !== seatIds.length) {
        throw new NotFoundException("Uno o más asientos no fueron encontrados");
      }

      const tripIds = new Set(seats.map((seat) => seat.trip?.tripId));
      if (tripIds.size !== 1) {
        throw new ConflictException(
          "Los asientos deben pertenecer al mismo viaje",
        );
      }

      // Check availability: expired reservations are considered available
      const unavailable = seats.filter((seat) => {
        if (seat.status === "sold") return true;
        if (seat.status === "reserved") {
          // If reservation expired, it's available again
          if (seat.reservedUntil && seat.reservedUntil < now) return false;
          // Reserved by this same user - allow re-reserving
          if (seat.reservedByUserId === userId) return false;
          return true;
        }
        return false;
      });

      if (unavailable.length > 0) {
        throw new ConflictException(
          `Los asientos ${unavailable.map((s) => s.seatNumber).join(", ")} no están disponibles`,
        );
      }

      // Update all seats to reserved
      for (const seat of seats) {
        seat.status = "reserved";
        seat.reservedByUserId = userId;
        seat.reservedUntil = reservedUntil;
      }

      await entityManager.getRepository(Seat).save(seats);
      return seats;
    });
  }

  /**
   * Release a reservation for a user (cancel selection).
   */
  async releaseReservation(seatIds: string[], userId: string) {
    const seats = await this.seatRepository.find({
      where: { seatId: In(seatIds) },
    });

    const toRelease = seats.filter(
      (s) => s.status === "reserved" && s.reservedByUserId === userId,
    );

    for (const seat of toRelease) {
      seat.status = "available";
      seat.reservedByUserId = null;
      seat.reservedUntil = null;
    }

    return this.seatRepository.save(toRelease);
  }

  /**
   * Clean up expired reservations (can be called periodically).
   */
  async cleanExpiredReservations() {
    const now = new Date();
    const expired = await this.seatRepository.find({
      where: { status: "reserved" },
    });
    const toExpire = expired.filter(
      (s) => s.reservedUntil && s.reservedUntil < now,
    );
    for (const seat of toExpire) {
      seat.status = "available";
      seat.reservedByUserId = null;
      seat.reservedUntil = null;
    }
    if (toExpire.length > 0) await this.seatRepository.save(toExpire);
    return { cleaned: toExpire.length };
  }
}
