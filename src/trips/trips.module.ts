import { Module } from "@nestjs/common";
import { TripsService } from "./trips.service";
import { TripsController } from "./trips.controller";
import { Trip } from "./entities/trip.entity";
import { Seat } from "../seats/entities/seat.entity";
import { Route } from "../routes/entities/route.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([Trip, Seat, Route]), AuthModule],
  controllers: [TripsController],
  providers: [TripsService],
  exports: [TripsService],
})
export class TripsModule {}
