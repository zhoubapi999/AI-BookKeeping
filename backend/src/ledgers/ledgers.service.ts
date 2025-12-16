import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Ledger, LedgerDocument } from "./schemas/ledger.schema";
import { CreateLedgerDto } from "./dto/create-ledger.dto";
import {
  TransactionEntity,
  TransactionDocument,
} from "../transactions/schemas/transaction.schema";

import { CategoriesService } from "../categories/categories.service";

@Injectable()
export class LedgersService {
  constructor(
    @InjectModel(Ledger.name) private ledgerModel: Model<LedgerDocument>,
    @InjectModel(TransactionEntity.name)
    private transactionModel: Model<TransactionDocument>,
    private categoriesService: CategoriesService,
  ) { }

  async create(
    createLedgerDto: CreateLedgerDto,
    userId: string,
  ): Promise<Ledger> {
    // Check if ledger with same title exists for the user
    const existingLedger = await this.ledgerModel.findOne({
      createdBy: userId,
      title: createLedgerDto.title,
    });
    if (existingLedger) {
      throw new ConflictException("您已拥有同名的旅行账本");
    }

    const { userIds = [], ...rest } = createLedgerDto;
    const users = [...new Set([userId, ...userIds])]; // Ensure creator is in users
    const newLedger = new this.ledgerModel({
      ...rest,
      users,
      createdBy: userId,
    });
    const savedLedger = await newLedger.save();
    // Initialize default categories for the ledger
    await this.categoriesService.createDefaults(
      userId,
      String(savedLedger._id),
    );
    return savedLedger;
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
      throw new NotFoundException(`未找到 ID 为 #${id} 的账本`);
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
      throw new NotFoundException(`未找到 ID 为 #${id} 的账本`);
    }
    return existingLedger;
  }

  async addUser(id: string, userId: string): Promise<Ledger> {
    const ledger = await this.ledgerModel
      .findByIdAndUpdate(id, { $addToSet: { users: userId } }, { new: true })
      .populate("users", "username email avatar");

    if (!ledger) throw new NotFoundException("未找到账本");

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
      throw new NotFoundException(`未找到 ID 为 #${id} 的账本`);
    }
    return deletedLedger;
  }
}
