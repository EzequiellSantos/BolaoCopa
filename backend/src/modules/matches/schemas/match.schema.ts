import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MatchDocument = Match & Document;

export enum MatchStatus {
  OPEN = 'OPEN',       // Aceita apostas
  CLOSED = 'CLOSED',   // Não aceita mais apostas
  FINISHED = 'FINISHED', // Resultado definido, pontos calculados
}

@Schema({
  timestamps: true,
  collection: 'matches',
})
export class Match {
  @Prop({
    required: true,
    trim: true,
    maxlength: 100,
  })
  homeTeam: string;

  @Prop({
    required: true,
    trim: true,
    maxlength: 100,
  })
  awayTeam: string;

  @Prop({ required: true })
  matchDate: Date;

  @Prop({
    type: String,
    enum: MatchStatus,
    default: MatchStatus.OPEN,
  })
  status: MatchStatus;

  // ─── Resultado (preenchido após FINISHED) ────────────────────────────
  @Prop({ type: Number, min: 0, default: null })
  homeScore: number | null;

  @Prop({ type: Number, min: 0, default: null })
  awayScore: number | null;

  @Prop({ trim: true, maxlength: 200 })
  description?: string; // Ex: "Grupo A - Rodada 1"

  @Prop({ trim: true, maxlength: 100 })
  stadium?: string;

  @Prop({ type: String, enum: ['home', 'away'], default: null })
  penaltyWinner: 'home' | 'away' | null;
}

export const MatchSchema = SchemaFactory.createForClass(Match);

// ─── Índices ──────────────────────────────────────────────────────────────────
MatchSchema.index({ status: 1 });
MatchSchema.index({ matchDate: 1 });