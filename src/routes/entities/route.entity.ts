import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Trip } from "../../trips/entities/trip.entity";

@Entity()
export class Route {
  @PrimaryGeneratedColumn("uuid")
  routeId: string;

  @Column("text")
  origin: string;

  @Column("text")
  destination: string;

  @Column("numeric", { precision: 10, scale: 2 })
  price: number;

  @Column("integer")
  durationMinutes: number;

  @Column("boolean", { default: true })
  isActive: boolean;

  @OneToMany(() => Trip, (trip) => trip.route)
  trips: Trip[];
}
