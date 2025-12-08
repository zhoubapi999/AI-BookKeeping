import { Body, Controller, Get, Patch } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { Settings } from '@app/types';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings(): Promise<Settings> {
    return this.settingsService.getSettings();
  }

  @Patch()
  async updateSettings(@Body() settings: Partial<Settings>): Promise<Settings> {
    return this.settingsService.updateSettings(settings);
  }
}
