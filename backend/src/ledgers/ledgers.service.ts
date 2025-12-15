import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Ledger, LedgerDocument } from "./schemas/ledger.schema";
import { CreateLedgerDto } from "./dto/create-ledger.dto";
import {
  TransactionEntity,
  TransactionDocument,
} from "../transactions/schemas/transaction.schema";

@Injectable()
export class LedgersService {
  constructor(
    @InjectModel(Ledger.name) private ledgerModel: Model<LedgerDocument>,
    @InjectModel(TransactionEntity.name)
    private transactionModel: Model<TransactionDocument>,
  ) { }

  async create(
    createLedgerDto: CreateLedgerDto,
    userId: string,
  ): Promise<Ledger> {
    const { userIds = [], ...rest } = createLedgerDto;
    const users = [...new Set([userId, ...userIds])]; // Ensure creator is in users
    const newLedger = new this.ledgerModel({
      ...rest,
      users,
      createdBy: userId,
    });
    return newLedger.save();
  }

  async findAll(userId: string): Promise<Ledger[]> {
    return this.ledgerModel
      .find({ users: userId })
      .populate("users", "username email avatar")
      .exec();
  }

  async findOne(id: string): Promise<Ledger> {
    const ledger = await this.ledgerModel
      .findById(id)
      .populate("users", "username email avatar")
      .populate("createdBy", "username email avatar")
      .exec();
    if (!ledger) {
      throw new NotFoundException(`Ledger #${id} not found`);
    }
    // Ensure toJSON is called with virtuals if needed by the framework,
    // but typically NestJS interceptor handles it.
    // We can explicitly trigger it if we want to debug, but usually not needed if schema is set.
    return ledger;
  }

  async update(id: string, updateLedgerDto: any): Promise<Ledger> {
    const existingLedger = await this.ledgerModel
      .findByIdAndUpdate(id, updateLedgerDto, { new: true })
      .exec();
    if (!existingLedger) {
      throw new NotFoundException(`Ledger #${id} not found`);
    }
    return existingLedger;
  }

  async addUser(id: string, userId: string): Promise<Ledger> {
    const ledger = await this.ledgerModel
      .findByIdAndUpdate(id, { $addToSet: { users: userId } }, { new: true })
      .populate("users", "username email avatar");

    if (!ledger) throw new NotFoundException("Ledger not found");

    // Auto-add new member to transactions with autoMember: true
    await this.transactionModel.updateMany(
      { ledgerId: id, autoMember: true },
      { $addToSet: { beneficiaryIds: userId } },
    );

    return ledger;
  }

  async remove(id: string): Promise<Ledger> {
    const deletedLedger = await this.ledgerModel.findByIdAndDelete(id);
    if (!deletedLedger) {
      throw new NotFoundException(`Ledger #${id} not found`);
    }
    return deletedLedger;
  }
}
