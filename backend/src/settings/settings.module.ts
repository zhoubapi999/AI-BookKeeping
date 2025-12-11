import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { SettingsEntity, SettingsSchema } from '../schemas/settings.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SettingsEntity.name, schema: SettingsSchema }]),
  ],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
