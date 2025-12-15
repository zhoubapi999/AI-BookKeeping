import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
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

  @Prop({ type: String, ref: "Ledger", required: false })
  ledgerId?: string;

  @Prop({ type: Types.ObjectId, ref: "User" })
  payerId?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: "User" }] })
  beneficiaryIds?: string[];

  @Prop({ default: false })
  autoMember?: boolean;
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
