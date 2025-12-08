import { Injectable } from '@nestjs/common';
import { JsonDbService } from '../db/json-db.service';
import { Settings } from '@app/types';

@Injectable()
export class SettingsService {
  constructor(private readonly db: JsonDbService) {}

  async getSettings(): Promise<Settings> {
    return this.db.read<Settings>('settings');
  }

  async updateSettings(settings: Partial<Settings>): Promise<Settings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    await this.db.write('settings', updated);
    return updated;
  }
}
