import { api } from './axios';
import type { AuthResponse, User, Match, Bet, RankingEntry, MatchStatus } from '../types';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }).then(r => r.data),

  register: (data: { name: string; email: string; password: string }) =>
    api.post<AuthResponse>('/auth/register', data).then(r => r.data),

  me: () =>
    api.get<{ user: User }>('/auth/me').then(r => r.data.user),
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersApi = {
  list: () =>
    api.get<User[]>('/users').then(r => r.data),

  getById: (id: string) =>
    api.get<User>(`/users/${id}`).then(r => r.data),

  create: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post<User>('/users', data).then(r => r.data),

  update: (id: string, data: Partial<{ name: string; email: string; password: string; isActive: boolean; role: string }>) =>
    api.patch<User>(`/users/${id}`, data).then(r => r.data),

  remove: (id: string) =>
    api.delete(`/users/${id}`),

  updateMyProfile: (data: Partial<{ name: string; email: string; password: string }>) =>
    api.patch<User>('/users/me/profile', data).then(r => r.data),
};

// ─── Matches ─────────────────────────────────────────────────────────────────
export const matchesApi = {
  list: (status?: MatchStatus) =>
    api.get<Match[]>('/matches', { params: status ? { status } : {} }).then(r => r.data),

  listOpen: () =>
    api.get<Match[]>('/matches/open').then(r => r.data),

  getById: (id: string) =>
    api.get<Match>(`/matches/${id}`).then(r => r.data),

  create: (data: {
    homeTeam: string;
    awayTeam: string;
    matchDate: string;
    description?: string;
    stadium?: string;
  }) => api.post<Match>('/matches', data).then(r => r.data),

  update: (id: string, data: Partial<{
    homeTeam: string;
    awayTeam: string;
    matchDate: string;
    status: string;
    homeScore: number;
    awayScore: number;
    description: string;
    stadium: string;
    penaltyWinner: 'home' | 'away';
  }>) => api.patch<Match>(`/matches/${id}`, data).then(r => r.data),

  updateStatus: (id: string, status: MatchStatus) =>
    api.patch<Match>(`/matches/${id}/status`, { status }).then(r => r.data),

  remove: (id: string) =>
    api.delete(`/matches/${id}`),
};

// ─── Bets ─────────────────────────────────────────────────────────────────────
export const betsApi = {
  create: (data: { matchId: string; homeScore: number; awayScore: number; penaltyWinner?: 'home' | 'away' }) =>
    api.post<Bet>('/bets', data).then(r => r.data),

  myBets: () =>
    api.get<Bet[]>('/bets/my').then(r => r.data),

  getById: (id: string) =>
    api.get<Bet>(`/bets/${id}`).then(r => r.data),

  update: (id: string, data: { homeScore?: number; awayScore?: number; penaltyWinner?: 'home' | 'away' | null }) =>
    api.patch<Bet>(`/bets/${id}`, data).then(r => r.data),

  adminAll: () =>
    api.get<Bet[]>('/bets/admin/all').then(r => r.data),

  adminByMatch: (matchId: string) =>
    api.get<Bet[]>(`/bets/admin/match/${matchId}`).then(r => r.data),
};

// ─── Notifications (push) ──────────────────────────────────────────────────────
export const notificationsApi = {
  getVapidKey: () =>
    api.get<{ publicKey: string }>('/notifications/vapid-public-key').then(r => r.data.publicKey),

  subscribe: (subscription: PushSubscriptionJSON) =>
    api.post('/notifications/subscribe', subscription).then(r => r.data),

  unsubscribe: (endpoint: string) =>
    api.delete('/notifications/subscribe', { data: { endpoint } }).then(r => r.data),

  broadcast: (title: string, body: string) =>
    api.post<{ sent: number; failed: number; total: number }>('/notifications/broadcast', { title, body }).then(r => r.data),
};

// ─── Ranking ──────────────────────────────────────────────────────────────────
export const rankingApi = {
  list: () =>
    api.get<RankingEntry[]>('/ranking').then(r => r.data),

  me: () =>
    api.get<{ entry: RankingEntry | null; position: number | null }>('/ranking/me').then(r => r.data),
};
