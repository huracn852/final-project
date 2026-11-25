import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { RoutesModule } from "./routes/routes.module";
import { TripsModule } from "./trips/trips.module";
import { SeatsModule } from "./seats/seats.module";
import { PurchasesModule } from "./purchases/purchases.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST ?? "localhost",
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USERNAME ?? "postgres",
      password: process.env.DB_PASSWORD ?? "ChihuahueniosPassword",
      database: process.env.DB_NAME ?? "chihuahuenos_db",
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    RoutesModule,
    TripsModule,
    SeatsModule,
    PurchasesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
