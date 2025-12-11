import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Category } from "@app/types";

export type CategoryDocument = Category & Document;

@Schema()
export class CategoryEntity {
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
  transform: function (doc, ret: any) {
    ret.id = ret._id.toString();
    delete ret._id;
  },
});
