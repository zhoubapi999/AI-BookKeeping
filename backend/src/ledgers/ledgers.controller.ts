import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from "@nestjs/common";
import { LedgersService } from "./ledgers.service";
import { CreateLedgerDto } from "./dto/create-ledger.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("ledgers")
@UseGuards(JwtAuthGuard)
export class LedgersController {
  constructor(private readonly ledgersService: LedgersService) {}

  @Post()
  create(@Request() req, @Body() createLedgerDto: CreateLedgerDto) {
    return this.ledgersService.create(createLedgerDto, req.user.userId);
  }

  @Get()
  findAll(@Request() req) {
    return this.ledgersService.findAll(req.user.userId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.ledgersService.findOne(id);
  }

  @Patch(":id/join")
  joinLedger(@Request() req, @Param("id") id: string) {
      return this.ledgersService.addUser(id, req.user.userId);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateLedgerDto: any) {
    return this.ledgersService.update(id, updateLedgerDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.ledgersService.remove(id);
  }
}
