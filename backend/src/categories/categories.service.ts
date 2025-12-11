import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Category } from "@app/types";
import { CategoryEntity, CategoryDocument } from "../schemas/category.schema";

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(CategoryEntity.name)
    private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(createCategoryDto: Omit<Category, "id">) {
    const createdCategory = new this.categoryModel(createCategoryDto);
    return createdCategory.save();
  }

  async findAll() {
    return this.categoryModel.find().exec();
  }

  async findOne(id: string) {
    return this.categoryModel.findById(id).exec();
  }

  async update(id: string, updateCategoryDto: Partial<Category>) {
    return this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .exec();
  }

  async remove(id: string) {
    await this.categoryModel.findByIdAndDelete(id).exec();
    return { success: true };
  }
}
