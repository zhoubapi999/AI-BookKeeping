import { Injectable } from '@nestjs/common';
import { JsonDbService } from '../db/json-db.service';
import { Transaction } from '@app/types';

@Injectable()
export class TransactionsService {
  constructor(private db: JsonDbService) {}

  async create(createTransactionDto: Omit<Transaction, 'id'>) {
    const transactions = await this.db.read<Transaction[]>('transactions');
    const newTransaction = { ...createTransactionDto, id: Date.now() };
    transactions.push(newTransaction);
    await this.db.write('transactions', transactions);
    return newTransaction;
  }

  async findAll() {
    const transactions = await this.db.read<Transaction[]>('transactions');
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async findOne(id: number) {
    const transactions = await this.db.read<Transaction[]>('transactions');
    return transactions.find((t) => t.id === id);
  }

  async update(id: number, updateTransactionDto: Partial<Transaction>) {
    const transactions = await this.db.read<Transaction[]>('transactions');
    const index = transactions.findIndex((t) => t.id === id);
    if (index > -1) {
      transactions[index] = { ...transactions[index], ...updateTransactionDto };
      await this.db.write('transactions', transactions);
      return transactions[index];
    }
    return null;
  }

  async remove(id: number) {
    const transactions = await this.db.read<Transaction[]>('transactions');
    const newTransactions = transactions.filter((t) => t.id !== id);
    await this.db.write('transactions', newTransactions);
    return { success: true };
  }
}
