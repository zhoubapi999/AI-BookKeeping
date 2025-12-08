import { Injectable } from '@nestjs/common';
import { JsonDbService } from '../db/json-db.service';
import { Category } from '@app/types';

@Injectable()
export class CategoriesService {
  constructor(private db: JsonDbService) {}

  async create(createCategoryDto: Omit<Category, 'id'>) {
    const categories = await this.db.read<Category[]>('categories');
    const newCategory = { ...createCategoryDto, id: Date.now() };
    categories.push(newCategory);
    await this.db.write('categories', categories);
    return newCategory;
  }

  async findAll() {
    return this.db.read<Category[]>('categories');
  }

  async findOne(id: number) {
    const categories = await this.db.read<Category[]>('categories');
    return categories.find((c) => c.id === id);
  }

  async update(id: number, updateCategoryDto: Partial<Category>) {
    const categories = await this.db.read<Category[]>('categories');
    const index = categories.findIndex((c) => c.id === id);
    if (index > -1) {
      categories[index] = { ...categories[index], ...updateCategoryDto };
      await this.db.write('categories', categories);
      return categories[index];
    }
    return null;
  }

  async remove(id: number) {
    const categories = await this.db.read<Category[]>('categories');
    const newCategories = categories.filter((c) => c.id !== id);
    await this.db.write('categories', newCategories);
    return { success: true };
  }
}
