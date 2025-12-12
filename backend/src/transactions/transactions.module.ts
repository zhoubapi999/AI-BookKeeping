import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { TransactionsController } from "./transactions.controller";
import { TransactionsService } from "./transactions.service";
import {
  TransactionEntity,
  TransactionSchema,
} from "./schemas/transaction.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TransactionEntity.name, schema: TransactionSchema },
    ]),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
