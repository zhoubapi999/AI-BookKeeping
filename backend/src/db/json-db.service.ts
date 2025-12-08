import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class JsonDbService {
  private readonly dataDir = path.join(process.cwd(), 'data');
  private readonly files = {
    transactions: path.join(this.dataDir, 'transactions.json'),
    categories: path.join(this.dataDir, 'categories.json'),
    settings: path.join(this.dataDir, 'settings.json'),
  };

  constructor() {
    this.init();
  }

  private async init() {
    try {
      await fs.access(this.dataDir);
    } catch {
      await fs.mkdir(this.dataDir);
    }

    for (const [key, file] of Object.entries(this.files)) {
      try {
        await fs.access(file);
      } catch {
        let initialData = '[]';
        if (key === 'categories') {
          initialData = JSON.stringify([
            { id: 1, name: '餐饮', type: 'expense', color: '#ef4444', icon: 'utensils' },
            { id: 2, name: '交通', type: 'expense', color: '#3b82f6', icon: 'car' },
            { id: 3, name: '购物', type: 'expense', color: '#a855f7', icon: 'shopping-bag' },
            { id: 4, name: '娱乐', type: 'expense', color: '#eab308', icon: 'film' },
            { id: 5, name: '工资', type: 'income', color: '#22c55e', icon: 'wallet' },
            { id: 6, name: '理财', type: 'income', color: '#14b8a6', icon: 'trending-up' },
          ], null, 2);
        } else if (key === 'settings') {
          initialData = JSON.stringify({ monthlyBudget: 5000 }, null, 2);
        }
        await fs.writeFile(file, initialData);
      }
    }
  }

  async read<T>(type: 'transactions' | 'categories' | 'settings'): Promise<T> {
    await this.init();
    const data = await fs.readFile(this.files[type], 'utf-8');
    return JSON.parse(data);
  }

  async write(type: 'transactions' | 'categories' | 'settings', data: any) {
    await this.init();
    await fs.writeFile(this.files[type], JSON.stringify(data, null, 2));
  }
}
