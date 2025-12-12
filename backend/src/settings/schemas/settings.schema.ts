import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Settings } from "@app/types";

export type SettingsDocument = Settings & Document;

@Schema()
export class SettingsEntity {
  @Prop({ required: true })
  userId: string;

  @Prop({ default: 0 })
  monthlyBudget: number;
}

export const SettingsSchema = SchemaFactory.createForClass(SettingsEntity);

SettingsSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc: Document, ret: Record<string, any>) {
    if (ret._id) {
      ret.id = String(ret._id);
      delete ret._id;
    }
  },
});
