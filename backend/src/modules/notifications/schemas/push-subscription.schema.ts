import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PushSubscriptionDocument = PushSubscription & Document;

@Schema({ _id: false })
export class PushKeys {
  @Prop({ required: true })
  p256dh: string;

  @Prop({ required: true })
  auth: string;
}

const PushKeysSchema = SchemaFactory.createForClass(PushKeys);

@Schema({
  timestamps: true,
  collection: 'pushsubscriptions',
})
export class PushSubscription {
  @Prop({ default: false })
  notificationSent: boolean;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user: Types.ObjectId;

  @Prop({ required: true, unique: true })
  endpoint: string;

  @Prop({ type: PushKeysSchema, required: true })
  keys: PushKeys;
}

export const PushSubscriptionSchema =
  SchemaFactory.createForClass(PushSubscription);

// ─── Índices ──────────────────────────────────────────────────────────────────
PushSubscriptionSchema.index({ endpoint: 1 }, { unique: true });
