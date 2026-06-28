// ─── Enums ────────────────────────────────────────────────────────────────────
export enum UserRole {
  ADMIN = 'ADMIN',
  USER  = 'USER',
}

export enum MatchStatus {
  OPEN     = 'OPEN',
  CLOSED   = 'CLOSED',
  FINISHED = 'FINISHED',
}

export enum BetResult {
  PENALTY_WINNER = 'PENALTY_WINNER',
  EXACT          = 'EXACT',
  PENALTY_DRAW   = 'PENALTY_DRAW',
  WINNER         = 'WINNER',
  MISS           = 'MISS',
  PENDING        = 'PENDING',
}

// ─── Entidades ────────────────────────────────────────────────────────────────
export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface Match {
  _id: string;
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  description?: string;
  stadium?: string;
  penaltyWinner?: 'home' | 'away' | null;
}

export interface Bet {
  _id: string;
  user: User | string;
  match: Match | string;
  homeScore: number;
  awayScore: number;
  penaltyWinner?: 'home' | 'away' | null;
  result: BetResult;
  points: number;
  createdAt: string;
}

export interface RankingEntry {
  position: number;
  userId: string;
  name: string;
  email: string;
  totalPoints: number;
  exactScores: number;
  correctWinners: number;
  totalBets: number;
  hitRate: number;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

// ─── API Error ────────────────────────────────────────────────────────────────
export interface ApiError {
  statusCode: number;
  message: string;
  errors?: string[];
}