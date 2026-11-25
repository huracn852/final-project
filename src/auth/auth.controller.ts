import { Controller, Post, Body, Res, Get } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { LoginUserDto } from "./dto/login.user.dto";
import { ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { TOKEN_NAME } from "./constants/jwt.constants";
import { Auth } from "./decorators/auth.decorators";
import { CurrentUser } from "./decorators/user.decorators";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post("login")
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = await this.authService.login(loginUserDto);
    const cookieSecure = process.env.COOKIE_SECURE === "true";
    response.cookie(TOKEN_NAME, token, {
      httpOnly: true,
      sameSite: cookieSecure ? "none" : "lax",
      secure: cookieSecure,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: "/",
    });
    return { message: "Login exitoso" };
  }

  @Auth()
  @Post("logout")
  logout(@Res({ passthrough: true }) response: Response) {
    const cookieSecure = process.env.COOKIE_SECURE === "true";
    response.clearCookie(TOKEN_NAME, {
      httpOnly: true,
      sameSite: cookieSecure ? "none" : "lax",
      secure: cookieSecure,
      path: "/",
    });
    return { message: "Sesión cerrada" };
  }

  @Auth()
  @Get("profile")
  getProfile(@CurrentUser() user: { userId: string }) {
    return this.authService.getProfile(user.userId);
  }
}
