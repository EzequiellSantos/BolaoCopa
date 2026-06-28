import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Match } from '../../matches/schemas/match.schema';

export type BetDocument = Bet & Document;

export enum BetResult {
  PENALTY_WINNER = 'PENALTY_WINNER', // Placar exato + acertou pênaltis → 5 pontos
  EXACT = 'EXACT',                   // Placar exato → 3 pontos
  PENALTY_DRAW = 'PENALTY_DRAW',     // Empate (placar errado) + acertou pênaltis → 2 pontos
  WINNER = 'WINNER',                 // Acertou vencedor/empate → 1 ponto
  MISS = 'MISS',                     // Errou → 0 pontos
  PENDING = 'PENDING',               // Jogo ainda não finalizado
}

@Schema({
  timestamps: true,
  collection: 'bets',
})
export class Bet {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  user: User;

  @Prop({
    type: Types.ObjectId,
    ref: 'Match',
    required: true,
  })
  match: Match;

  // ─── Palpite do usuário ───────────────────────────────────────────────
  @Prop({ required: true, min: 0 })
  homeScore: number;

  @Prop({ required: true, min: 0 })
  awayScore: number;

  @Prop({ type: String, enum: ['home', 'away'], default: null })
  penaltyWinner: 'home' | 'away' | null;

  // ─── Resultado calculado após o jogo ─────────────────────────────────
  @Prop({
    type: String,
    enum: BetResult,
    default: BetResult.PENDING,
  })
  result: BetResult;

  @Prop({ type: Number, default: 0, min: 0, max: 5 })
  points: number;
}

export const BetSchema = SchemaFactory.createForClass(Bet);

// ─── Índices ──────────────────────────────────────────────────────────────────
// Garante que 1 usuário só pode ter 1 aposta por partida
BetSchema.index({ user: 1, match: 1 }, { unique: true });
BetSchema.index({ user: 1 });
BetSchema.index({ match: 1 });