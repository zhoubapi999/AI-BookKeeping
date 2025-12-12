import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Settings } from "@app/types";
import { UpdateSettingsDto } from "./dto/update-settings.dto";
import { SettingsEntity, SettingsDocument } from "./schemas/settings.schema";

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(SettingsEntity.name)
    private settingsModel: Model<SettingsDocument>,
  ) {}

  async getSettings(userId: string): Promise<Settings> {
    const settings = await this.settingsModel.findOne({ userId }).exec();
    if (!settings) {
      // Create default settings if not exists
      const newSettings = new this.settingsModel({ monthlyBudget: 0, userId });
      return newSettings.save();
    }
    return settings;
  }

  async updateSettings(
    userId: string,
    settings: UpdateSettingsDto,
  ): Promise<Settings> {
    const existing = await this.settingsModel.findOne({ userId }).exec();
    if (existing) {
      return this.settingsModel
        .findByIdAndUpdate(existing._id, settings, { new: true })
        .exec() as unknown as Promise<Settings>;
    } else {
      const newSettings = new this.settingsModel({ ...settings, userId });
      return newSettings.save();
    }
  }
}
