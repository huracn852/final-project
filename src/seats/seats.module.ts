import { Module } from "@nestjs/common";
import { SeatsService } from "./seats.service";
import { SeatsController } from "./seats.controller";
import { Seat } from "./entities/seat.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([Seat]), AuthModule],
  controllers: [SeatsController],
  providers: [SeatsService],
  exports: [SeatsService],
})
export class SeatsModule {}
