import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Roles } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) return true;
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const userRoles = user?.userRoles ?? user?.userRole;
    const normalizedUserRoles = Array.isArray(userRoles)
      ? userRoles.filter(
          (role: unknown): role is string => typeof role === "string",
        )
      : typeof userRoles === "string"
        ? userRoles.split(",")
        : [];
    return this.matchRoles(roles, normalizedUserRoles);
  }

  private matchRoles(roles: string[], userRoles: string[]): boolean {
    const allowedRoles = new Set(roles.map((r) => r.trim().toLowerCase()));
    return userRoles.some((r) => allowedRoles.has(r.trim().toLowerCase()));
  }
}
