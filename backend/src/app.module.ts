import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TransactionsModule } from "./transactions/transactions.module";
import { CategoriesModule } from "./categories/categories.module";
import { SettingsModule } from "./settings/settings.module";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { LedgersModule } from "./ledgers/ledgers.module";
import { ItinerariesModule } from "./itineraries/itineraries.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV || "development"}`, ".env"],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>("MONGO_URI"),
      }),
      inject: [ConfigService],
    }),
    TransactionsModule,
    CategoriesModule,
    SettingsModule,
    UsersModule,
    AuthModule,
    LedgersModule,
    ItinerariesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
