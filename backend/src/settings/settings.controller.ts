import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
  Request,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { SettingsService } from "./settings.service";
import { Settings } from "@app/types";
import { UpdateSettingsDto } from "./dto/update-settings.dto";
import type { RequestWithUser } from "../types";

@Controller("settings")
@UseGuards(AuthGuard("jwt"))
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) { }

  @Get()
  async getSettings(@Request() req: RequestWithUser): Promise<Settings> {
    return this.settingsService.getSettings(req.user.userId);
  }

  @Patch()
  async updateSettings(
    @Request() req: RequestWithUser,
    @Body() settings: UpdateSettingsDto,
  ): Promise<Settings> {
    return this.settingsService.updateSettings(req.user.userId, settings);
  }
}
