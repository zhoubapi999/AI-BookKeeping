import { Injectable } from "@nestjs/common";
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
  ) {}

  async create(userId: string, createCategoryDto: CreateCategoryDto) {
    const createdCategory = new this.categoryModel({
      ...createCategoryDto,
      userId,
    });
    return createdCategory.save();
  }

  async findAll(userId: string) {
    return this.categoryModel.find({ userId }).exec();
  }

  async findOne(id: string, userId: string) {
    return this.categoryModel.findOne({ _id: id, userId }).exec();
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    userId: string,
  ) {
    return this.categoryModel
      .findOneAndUpdate({ _id: id, userId }, updateCategoryDto, { new: true })
      .exec();
  }

  async remove(id: string, userId: string) {
    await this.categoryModel.findOneAndDelete({ _id: id, userId }).exec();
    return { success: true };
  }

  async createDefaults(userId: string) {
    const defaultCategories = [
      { name: '餐饮', type: 'expense', icon: 'food', color: '#ff7f50' },
      { name: '购物', type: 'expense', icon: 'shopping', color: '#ff69b4' },
      { name: '交通', type: 'expense', icon: 'transport', color: '#1e90ff' },
      { name: '居住', type: 'expense', icon: 'home', color: '#ffa500' },
      { name: '娱乐', type: 'expense', icon: 'entertainment', color: '#9370db' },
      { name: '医疗', type: 'expense', icon: 'health', color: '#3cb371' },
      { name: '工资', type: 'income', icon: 'other', color: '#ffd700' },
      { name: '兼职', type: 'income', icon: 'other', color: '#32cd32' },
      { name: '理财', type: 'income', icon: 'trending-up', color: '#ff4500' },
      { name: '其他', type: 'expense', icon: 'other', color: '#808080' },
    ];

    const operations = defaultCategories.map((cat) => ({
      insertOne: {
        document: { ...cat, userId },
      },
    }));

    await this.categoryModel.bulkWrite(operations);
  }
}
