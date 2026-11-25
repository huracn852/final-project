import { Module } from "@nestjs/common";
import { RoutesService } from "./routes.service";
import { RoutesController } from "./routes.controller";
import { Route } from "./entities/route.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([Route]), AuthModule],
  controllers: [RoutesController],
  providers: [RoutesService],
  exports: [RoutesService],
})
export class RoutesModule {}
