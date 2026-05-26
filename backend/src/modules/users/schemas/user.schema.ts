import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

@Schema({
  timestamps: true,
  collection: 'users',
  toJSON: {
    transform: (_doc, ret) => {
      delete ret.password;
      return ret;
    },
  },
})
export class User {
  @Prop({
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
  })
  name: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({
    required: true,
    minlength: 6,
    select: false, // Nunca retorna o password nas queries por padrão
  })
  password: string;

  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

// ─── Índices ──────────────────────────────────────────────────────────────────
UserSchema.index({ email: 1 }, { unique: true });