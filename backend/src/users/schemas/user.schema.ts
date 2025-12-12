import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type UserDocument = User & Document;

@Schema({
  toJSON: {
    virtuals: true,
    getters: true,
    transform: (doc: Document, ret: Record<string, any>) => {
      if (ret._id) {
        delete ret._id;
      }
      if (ret.__v !== undefined) {
        delete ret.__v;
      }
      if (ret.password) {
        delete ret.password; // Hide password in response
      }
      return ret;
    },
  },
})
export class User {
  @Prop({ required: true, unique: true })
  phone: string;

  @Prop({ required: true })
  password?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
