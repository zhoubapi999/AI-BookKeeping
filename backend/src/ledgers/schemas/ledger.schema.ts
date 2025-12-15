import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { User } from "../../users/schemas/user.schema";

export type LedgerDocument = Ledger & Document;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
    transform: (doc: Document, ret: Record<string, any>) => {
      if (ret._id) {
        ret.id = String(ret._id);
        delete ret._id;
      }
      if (ret.__v !== undefined) {
        delete ret.__v;
      }
      return ret;
    },
  },
})
export class Ledger {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop()
  coverImage: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: "User" }] })
  users: User[];

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  createdBy: User;
}

export const LedgerSchema = SchemaFactory.createForClass(Ledger);
