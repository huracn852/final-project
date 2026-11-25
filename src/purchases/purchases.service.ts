import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Purchase } from "./entities/purchase.entity";
import { Seat } from "../seats/entities/seat.entity";
import { User } from "../auth/entities/user.entity";
import { CreatePurchaseDto } from "./dto/create-purchase.dto";

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
    @InjectRepository(Seat)
    private seatRepository: Repository<Seat>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Confirm purchase of reserved seats. Seats must be reserved by the same user.
   */
  async create(createPurchaseDto: CreatePurchaseDto, userId: string) {
    return this.purchaseRepository.manager.transaction(
      async (entityManager) => {
        const { seatIds } = createPurchaseDto;

        const user = await entityManager
          .getRepository(User)
          .findOneBy({ userId });
        if (!user) throw new NotFoundException("Usuario no encontrado");

        const seats = await entityManager.getRepository(Seat).find({
          where: { seatId: In(seatIds) },
          relations: { trip: { route: true } },
          lock: { mode: "pessimistic_write" },
        });

        if (seats.length !== seatIds.length) {
          throw new NotFoundException(
            "Uno o más asientos no fueron encontrados",
          );
        }

        const tripIds = new Set(seats.map((seat) => seat.trip?.tripId));
        if (tripIds.size !== 1) {
          throw new ConflictException(
            "Los asientos deben pertenecer al mismo viaje",
          );
        }

        const now = new Date();

        // Validate all seats are reserved by this user and not expired
        for (const seat of seats) {
          if (seat.status !== "reserved") {
            throw new ConflictException(
              `El asiento ${seat.seatNumber} no está reservado`,
            );
          }
          if (seat.reservedByUserId !== userId) {
            throw new ConflictException(
              `El asiento ${seat.seatNumber} está reservado por otro usuario`,
            );
          }
          if (seat.reservedUntil && seat.reservedUntil < now) {
            throw new ConflictException(
              `La reserva del asiento ${seat.seatNumber} ha expirado. Por favor vuelve a seleccionarlo.`,
            );
          }
        }

        // Create purchase records and mark seats as sold
        const purchases: Purchase[] = [];
        for (const seat of seats) {
          const price = Number(seat.trip?.route?.price ?? 0);
          const purchase = entityManager.getRepository(Purchase).create({
            user,
            seat,
            totalPrice: price,
            status: "confirmed",
          });
          purchases.push(purchase);

          seat.status = "sold";
          seat.reservedByUserId = null;
          seat.reservedUntil = null;
        }

        await entityManager.getRepository(Seat).save(seats);
        return entityManager.getRepository(Purchase).save(purchases);
      },
    );
  }

  findMyPurchases(userId: string) {
    return this.purchaseRepository.find({
      where: { user: { userId } },
      relations: { seat: { trip: { route: true } } },
      order: { purchasedAt: "DESC" },
    });
  }

  findAll() {
    return this.purchaseRepository.find({
      relations: { user: true, seat: { trip: { route: true } } },
      order: { purchasedAt: "DESC" },
    });
  }
}
