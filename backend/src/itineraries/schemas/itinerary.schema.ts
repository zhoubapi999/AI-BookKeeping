import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ItineraryDocument = ItineraryItem & Document;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
    transform: (doc: Document, ret: Record<string, any>) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class ItineraryItem {
  @Prop({ type: Types.ObjectId, ref: "Ledger", required: true })
  ledgerId: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  date: Date; // The specific date and time of the event

  @Prop()
  location: string;

  @Prop()
  imageUrl: string; // For travel journal photos

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  createdBy: string;
}

export const ItinerarySchema = SchemaFactory.createForClass(ItineraryItem);
