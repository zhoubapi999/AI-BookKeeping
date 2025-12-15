import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import {
  TransactionEntity,
  TransactionDocument,
} from "./schemas/transaction.schema";
import { Ledger, LedgerDocument } from "../ledgers/schemas/ledger.schema";

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(TransactionEntity.name)
    private transactionModel: Model<TransactionDocument>,
    @InjectModel(Ledger.name)
    private ledgerModel: Model<LedgerDocument>,
  ) { }

  async create(userId: string, createTransactionDto: CreateTransactionDto) {
    const createdTransaction = new this.transactionModel({
      ...createTransactionDto,
      userId,
    });
    return createdTransaction.save();
  }

  async findAll(userId: string, ledgerId?: string) {
    if (ledgerId) {
      // If ledgerId is provided, return all transactions for that ledger
      // TODO: Add check if user belongs to ledger
      return this.transactionModel
        .find({ ledgerId })
        .populate("payerId", "username avatar")
        .populate("beneficiaryIds", "username avatar")
        .sort({ date: -1 })
        .exec();
    }

    // Otherwise return personal transactions (or all transactions created by user)
    const query: any = { userId };
    return this.transactionModel.find(query).sort({ date: -1 }).exec();
  }

  async findOne(id: string, userId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException("Transaction not found");
    }
    const transaction = await this.transactionModel.findById(id);
    if (!transaction) return null;

    if (transaction.userId === userId) return transaction;

    if (transaction.ledgerId) {
      const ledger = await this.ledgerModel.findById(transaction.ledgerId);
      if (
        ledger &&
        (String(ledger.createdBy) === userId ||
          (typeof ledger.createdBy === "object" &&
            String((ledger.createdBy as any)._id) === userId) ||
          ledger.users.some((u) => String(u) === userId))
      ) {
        return transaction;
      }
    }
    return null;
  }

  async update(
    id: string,
    updateTransactionDto: UpdateTransactionDto,
    userId: string,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException("Transaction not found");
    }

    const transaction = await this.transactionModel.findById(id);
    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    // Check permissions
    let hasPermission = transaction.userId === userId;

    if (!hasPermission && transaction.ledgerId) {
      const ledger = await this.ledgerModel.findById(transaction.ledgerId);
      if (ledger) {
        // Check if user is creator or member
        const isCreator =
          String(ledger.createdBy) === userId ||
          (typeof ledger.createdBy === "object" &&
            String((ledger.createdBy as any)._id) === userId);
        const isMember = ledger.users.some((u) => String(u) === userId);

        if (isCreator || isMember) {
          hasPermission = true;
        }
      }
    }

    if (!hasPermission) {
      throw new ForbiddenException(
        "You do not have permission to update this transaction",
      );
    }

    return this.transactionModel
      .findByIdAndUpdate(id, updateTransactionDto, {
        new: true,
      })
      .exec();
  }

  async remove(id: string, userId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException("Transaction not found");
    }

    const transaction = await this.transactionModel.findById(id);
    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    // Check permissions
    let hasPermission = transaction.userId === userId;

    if (!hasPermission && transaction.ledgerId) {
      const ledger = await this.ledgerModel.findById(transaction.ledgerId);
      if (ledger) {
        const isCreator =
          String(ledger.createdBy) === userId ||
          (typeof ledger.createdBy === "object" &&
            String((ledger.createdBy as any)._id) === userId);
        const isMember = ledger.users.some((u) => String(u) === userId);

        if (isCreator || isMember) {
          hasPermission = true;
        }
      }
    }

    if (!hasPermission) {
      throw new ForbiddenException(
        "You do not have permission to delete this transaction",
      );
    }

    await this.transactionModel.findByIdAndDelete(id).exec();
    return { success: true };
  }
}
