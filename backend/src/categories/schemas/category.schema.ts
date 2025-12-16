import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Category } from "@app/types";

export type CategoryDocument = Category & Document;

@Schema()
export class CategoryEntity {
  @Prop({ required: false })
  userId: string;

  @Prop({ required: false })
  ledgerId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ["income", "expense"] })
  type: "income" | "expense";

  @Prop({ required: true })
  color: string;

  @Prop({ required: true })
  icon: string;
}

export const CategorySchema = SchemaFactory.createForClass(CategoryEntity);

CategorySchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc: Document, ret: Record<string, any>) {
    if (ret._id) {
      ret.id = String(ret._id);
      delete ret._id;
    }
  },
});
