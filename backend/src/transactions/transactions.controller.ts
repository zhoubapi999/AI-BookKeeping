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
import { AuthGuard } from "@nestjs/passport";
import { TransactionsService } from "./transactions.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import type { RequestWithUser } from "../types";

@Controller("transactions")
@UseGuards(AuthGuard("jwt"))
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) { }

  @Post()
  create(
    @Request() req: RequestWithUser,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    return this.transactionsService.create(
      req.user.userId,
      createTransactionDto,
    );
  }

  @Get()
  findAll(@Request() req: RequestWithUser) {
    return this.transactionsService.findAll(req.user.userId);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @Request() req: RequestWithUser) {
    return this.transactionsService.findOne(id, req.user.userId);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @Request() req: RequestWithUser,
  ) {
    return this.transactionsService.update(
      id,
      updateTransactionDto,
      req.user.userId,
    );
  }

  @Delete(":id")
  remove(@Param("id") id: string, @Request() req: RequestWithUser) {
    return this.transactionsService.remove(id, req.user.userId);
  }
}
