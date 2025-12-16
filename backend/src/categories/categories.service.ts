import { Injectable, ConflictException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { CategoryEntity, CategoryDocument } from "./schemas/category.schema";

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(CategoryEntity.name)
    private categoryModel: Model<CategoryDocument>,
  ) { }

  async create(userId: string, createCategoryDto: CreateCategoryDto) {
    const { name, ledgerId } = createCategoryDto;

    // Check if category with same name exists for this user/ledger
    const query = ledgerId
      ? { ledgerId, name }
      : { userId, name, $or: [{ ledgerId: { $exists: false } }, { ledgerId: null }] };

    const existingCategory = await this.categoryModel.findOne(query);
    if (existingCategory) {
      throw new ConflictException("该分类名称已存在");
    }

    const createdCategory = new this.categoryModel({
      ...createCategoryDto,
      userId,
    });
    return createdCategory.save();
  }

  async findAll(userId: string, ledgerId?: string) {
    if (ledgerId) {
      const categories = await this.categoryModel.find({ ledgerId }).exec();
      if (categories.length === 0) {
        // Lazy initialization for existing ledgers or new ledgers without categories
        await this.createDefaults(userId, ledgerId);
        return this.categoryModel.find({ ledgerId }).exec();
      }
      return categories;
    }
    // Find personal categories (where ledgerId is null or undefined)
    return this.categoryModel
      .find({
        userId,
        $or: [{ ledgerId: { $exists: false } }, { ledgerId: null }],
      })
      .exec();
  }

  async findOne(id: string, userId: string) {
    // We might need to check if the user has access to the ledger if it's a ledger category
    // For now, let's just check ID. Permission checks should be in controller/guard if needed.
    // But to be safe, we can check userId OR (ledgerId and user is member).
    // Simpler: find by ID and let the controller handle logic, or basic check here.
    return this.categoryModel.findById(id).exec();
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    userId: string,
  ) {
    // TODO: Add permission check for ledger categories
    return this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .exec();
  }

  async remove(id: string, userId: string) {
    // TODO: Add permission check for ledger categories
    await this.categoryModel.findByIdAndDelete(id).exec();
    return { success: true };
  }

  async createDefaults(userId: string, ledgerId?: string) {
    const defaultCategories = [
      { name: "餐饮", type: "expense", icon: "food", color: "#ff7f50" },
      { name: "购物", type: "expense", icon: "shopping", color: "#ff69b4" },
      { name: "交通", type: "expense", icon: "transport", color: "#1e90ff" },
      { name: "居住", type: "expense", icon: "home", color: "#ffa500" },
      { name: "生活", type: "expense", icon: "utilities", color: "#00ced1" },
      {
        name: "娱乐",
        type: "expense",
        icon: "entertainment",
        color: "#9370db",
      },
      { name: "服饰", type: "expense", icon: "clothing", color: "#ff1493" },
      { name: "人情", type: "expense", icon: "gift", color: "#ff6347" },
      { name: "教育", type: "expense", icon: "education", color: "#4682b4" },
      { name: "医疗", type: "expense", icon: "health", color: "#3cb371" },
      { name: "其他", type: "expense", icon: "other", color: "#808080" },
      { name: "工资", type: "income", icon: "other", color: "#ffd700" },
      { name: "兼职", type: "income", icon: "other", color: "#32cd32" },
      { name: "理财", type: "income", icon: "trending-up", color: "#ff4500" },
    ];

    const operations = defaultCategories.map((cat) => ({
      insertOne: {
        document: { ...cat, userId, ledgerId },
      },
    }));

    await this.categoryModel.bulkWrite(operations);
  }
}
