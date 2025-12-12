import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import {
  TransactionEntity,
  TransactionDocument,
} from "./schemas/transaction.schema";

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(TransactionEntity.name)
    private transactionModel: Model<TransactionDocument>,
  ) {}

  async create(userId: string, createTransactionDto: CreateTransactionDto) {
    const createdTransaction = new this.transactionModel({
      ...createTransactionDto,
      userId,
    });
    return createdTransaction.save();
  }

  async findAll(userId: string) {
    return this.transactionModel.find({ userId }).sort({ date: -1 }).exec();
  }

  async findOne(id: string, userId: string) {
    return this.transactionModel.findOne({ _id: id, userId }).exec();
  }

  async update(
    id: string,
    updateTransactionDto: UpdateTransactionDto,
    userId: string,
  ) {
    return this.transactionModel
      .findOneAndUpdate({ _id: id, userId }, updateTransactionDto, {
        new: true,
      })
      .exec();
  }

  async remove(id: string, userId: string) {
    await this.transactionModel.findOneAndDelete({ _id: id, userId }).exec();
    return { success: true };
  }
}
