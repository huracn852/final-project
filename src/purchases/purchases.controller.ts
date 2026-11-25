import { Controller, Get, Post, Body } from "@nestjs/common";
import { PurchasesService } from "./purchases.service";
import { CreatePurchaseDto } from "./dto/create-purchase.dto";
import { ApiTags } from "@nestjs/swagger";
import { Auth } from "../auth/decorators/auth.decorators";
import { ROLES } from "../auth/constants/roles.constants";
import { CurrentUser } from "../auth/decorators/user.decorators";

@ApiTags("Purchases")
@Controller("purchases")
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Auth()
  @Post()
  create(
    @Body() createPurchaseDto: CreatePurchaseDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.purchasesService.create(createPurchaseDto, user.userId);
  }

  @Auth()
  @Get("my")
  findMyPurchases(@CurrentUser() user: { userId: string }) {
    return this.purchasesService.findMyPurchases(user.userId);
  }

  @Auth(ROLES.Admin)
  @Get()
  findAll() {
    return this.purchasesService.findAll();
  }
}
