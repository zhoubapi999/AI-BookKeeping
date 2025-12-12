import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Transaction } from "@app/types";

export type TransactionDocument = Transaction & Document;

@Schema()
export class TransactionEntity {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, enum: ["income", "expense"] })
  type: "income" | "expense";

  @Prop({ required: true })
  categoryId: string;

  @Prop({ required: true })
  date: string;

  @Prop({ default: "" })
  note: string;
}

export const TransactionSchema =
  SchemaFactory.createForClass(TransactionEntity);

TransactionSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc: Document, ret: Record<string, any>) {
    if (ret._id) {
      ret.id = String(ret._id);
      delete ret._id;
    }
  },
});
