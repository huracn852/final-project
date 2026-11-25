import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

export const Cookies = createParamDecorator(
  (
    cookieName: string,
    ctx: ExecutionContext,
  ): string | Record<string, unknown> | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return cookieName ? request.cookies?.[cookieName] : request.cookies;
  },
);
