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
}
