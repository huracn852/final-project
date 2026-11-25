import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Route } from "../../routes/entities/route.entity";
import { Seat } from "../../seats/entities/seat.entity";

@Entity()
export class Trip {
  @PrimaryGeneratedColumn("uuid")
  tripId: string;

  @ManyToOne(() => Route, (route) => route.trips, { eager: true })
  route: Route;

  @Column("timestamp")
  departureTime: Date;

  @Column("timestamp")
  arrivalTime: Date;

  @Column("integer")
  totalSeats: number;

  @Column("boolean", { default: true })
  isActive: boolean;

  @OneToMany(() => Seat, (seat) => seat.trip, { cascade: true })
  seats: Seat[];
}
