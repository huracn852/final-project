import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser = require("cookie-parser");

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: [
        process.env.ALLOWEDORIGIN ?? "http://127.0.0.1:3000",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
      ],
      credentials: true,
    },
  });
  app.use(cookieParser());
  const config = new DocumentBuilder()
    .setTitle("Chihuahueños API")
    .setDescription(
      "API para el sistema de compra de boletos de Chihuahueños S.A. de C.V.",
    )
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, documentFactory);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(Number(process.env.APP_PORT ?? 4000));
}
bootstrap();
