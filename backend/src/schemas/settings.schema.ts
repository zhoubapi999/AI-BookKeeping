import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Settings } from "@app/types";

export type SettingsDocument = Settings & Document;

@Schema()
export class SettingsEntity {
  @Prop({ default: 0 })
  monthlyBudget: number;
}

export const SettingsSchema = SchemaFactory.createForClass(SettingsEntity);

SettingsSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret: any) {
    ret.id = ret._id.toString();
    delete ret._id;
  },
});
