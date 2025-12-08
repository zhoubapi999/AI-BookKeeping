import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransactionsModule } from './transactions/transactions.module';
import { CategoriesModule } from './categories/categories.module';
import { SettingsModule } from './settings/settings.module';
import { DbModule } from './db/db.module';

@Module({
  imports: [DbModule, TransactionsModule, CategoriesModule, SettingsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
