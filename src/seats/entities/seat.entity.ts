import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
  UpdateDateColumn,
} from "typeorm";
import { Trip } from "../../trips/entities/trip.entity";
import { Purchase } from "../../purchases/entities/purchase.entity";

export type SeatStatus = "available" | "reserved" | "sold";

@Entity()
export class Seat {
  @PrimaryGeneratedColumn("uuid")
  seatId: string;

  @ManyToOne(() => Trip, (trip) => trip.seats)
  trip: Trip;

  @Column("integer")
  seatNumber: number;

  @Column("varchar", { length: 20, default: "available" })
  status: SeatStatus;

  // When status='reserved', this is the user who reserved it
  @Column("text", { nullable: true })
  reservedByUserId: string | null;

  // When a seat is reserved, this timestamp is used to auto-expire the reservation
  @Column("timestamp", { nullable: true })
  reservedUntil: Date | null;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Purchase, (purchase) => purchase.seat, { nullable: true })
  purchase: Purchase | null;
}
