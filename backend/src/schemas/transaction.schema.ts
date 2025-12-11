import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Transaction } from '@app/types';

export type TransactionDocument = Transaction & Document;

@Schema()
export class TransactionEntity {
  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, enum: ['income', 'expense'] })
  type: 'income' | 'expense';

  @Prop({ required: true })
  categoryId: string;

  @Prop({ required: true })
  date: string;

  @Prop({ default: '' })
  note: string;
}

export const TransactionSchema = SchemaFactory.createForClass(TransactionEntity);

TransactionSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret: any) {
    ret.id = ret._id.toString();
    delete ret._id;
  },
});
