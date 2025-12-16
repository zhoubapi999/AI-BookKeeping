import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { LedgersService } from "./ledgers.service";
import { LedgersController } from "./ledgers.controller";
import { Ledger, LedgerSchema } from "./schemas/ledger.schema";
import { UsersModule } from "../users/users.module";
import {
  TransactionEntity,
  TransactionSchema,
} from "../transactions/schemas/transaction.schema";
import { CategoriesModule } from "../categories/categories.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Ledger.name, schema: LedgerSchema },
      { name: TransactionEntity.name, schema: TransactionSchema },
    ]),
    UsersModule,
    CategoriesModule,
  ],
  controllers: [LedgersController],
  providers: [LedgersService],
  exports: [LedgersService],
})
export class LedgersModule { }
