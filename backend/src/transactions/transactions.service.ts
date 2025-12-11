import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction } from '@app/types';
import { TransactionEntity, TransactionDocument } from '../schemas/transaction.schema';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(TransactionEntity.name) private transactionModel: Model<TransactionDocument>,
  ) {}

  async create(createTransactionDto: Omit<Transaction, 'id'>) {
    const createdTransaction = new this.transactionModel(createTransactionDto);
    return createdTransaction.save();
  }

  async findAll() {
    return this.transactionModel.find().sort({ date: -1 }).exec();
  }

  async findOne(id: string) {
    return this.transactionModel.findById(id).exec();
  }

  async update(id: string, updateTransactionDto: Partial<Transaction>) {
    return this.transactionModel
      .findByIdAndUpdate(id, updateTransactionDto, { new: true })
      .exec();
  }

  async remove(id: string) {
    await this.transactionModel.findByIdAndDelete(id).exec();
    return { success: true };
  }
}
