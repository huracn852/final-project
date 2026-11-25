import { applyDecorators, UseGuards } from "@nestjs/common";
import { Roles } from "./roles.decorator";
import { AuthGuard } from "../guards/auth.guard";
import { RolesGuard } from "../guards/roles.guard";
import { ROLES } from "../constants/roles.constants";

export const Auth = (...roles: ROLES[]) => {
  return applyDecorators(
    ...(roles.length > 0 ? [Roles(roles)] : []),
    UseGuards(AuthGuard, ...(roles.length > 0 ? [RolesGuard] : [])),
  );
};
