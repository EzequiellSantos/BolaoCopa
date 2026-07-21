import { MatchOdds } from './odds.util';

// Odds 1X2 reais (moneyline) de casas de apostas (bet365, FanDuel, Pinnacle,
// DraftKings, BetOnline etc.), coletadas de matérias de preview/apostas
// (CBS Sports, ESPN, Yahoo Sports, FOX Sports, SportsLine, RotoWire, entre
// outras) para as 104 partidas REAIS da Copa do Mundo 2026 — tanto o
// sorteio de grupos (5/dez/2025) quanto os resultados do mata-mata deste
// bolão correspondem ao torneio real (confirmado batendo resultados como
// "Paraguai elimina a Alemanha nos pênaltis" e "França 3x0 Suécia" com o
// banco de dados). Os placares no banco são os reais; as odds abaixo são as
// odds pré-jogo praticadas pelo mercado antes de cada partida.
const key = (home: string, away: string) => `${home}__${away}`;

export const REAL_MATCH_ODDS: Record<string, MatchOdds> = {
  // ═══ FASE DE GRUPOS ═══════════════════════════════════════════════════

  // ─── Grupo A ──────────────────────────────────────────────────────────
  [key('México', 'África do Sul')]: { home: 1.48, draw: 4.33, away: 6.50 },
  [key('Coreia do Sul', 'República Tcheca')]: { home: 2.60, draw: 3.00, away: 2.95 },
  [key('República Tcheca', 'África do Sul')]: { home: 1.80, draw: 3.50, away: 4.60 },
  [key('México', 'Coreia do Sul')]: { home: 2.00, draw: 3.30, away: 4.10 },
  [key('República Tcheca', 'México')]: { home: 3.92, draw: 3.98, away: 2.02 },
  [key('África do Sul', 'Coreia do Sul')]: { home: 6.25, draw: 4.07, away: 1.61 },

  // ─── Grupo B ──────────────────────────────────────────────────────────
  [key('Canadá', 'Bósnia')]: { home: 1.83, draw: 3.65, away: 4.70 },
  [key('Qatar', 'Suíça')]: { home: 9.50, draw: 5.50, away: 1.30 },
  [key('Suíça', 'Bósnia')]: { home: 1.53, draw: 4.20, away: 6.00 },
  [key('Canadá', 'Qatar')]: { home: 1.29, draw: 5.70, away: 10.50 },
  [key('Suíça', 'Canadá')]: { home: 2.35, draw: 3.25, away: 2.38 },
  [key('Bósnia', 'Qatar')]: { home: 1.45, draw: 5.61, away: 9.25 },

  // ─── Grupo C ──────────────────────────────────────────────────────────
  [key('Brasil', 'Marrocos')]: { home: 1.67, draw: 3.70, away: 5.70 },
  [key('Haiti', 'Escócia')]: { home: 6.50, draw: 4.33, away: 1.57 },
  [key('Escócia', 'Marrocos')]: { home: 6.00, draw: 3.60, away: 1.65 },
  [key('Brasil', 'Haiti')]: { home: 1.10, draw: 10.50, away: 21.00 },
  [key('Escócia', 'Brasil')]: { home: 8.00, draw: 6.00, away: 1.29 },
  [key('Marrocos', 'Haiti')]: { home: 1.22, draw: 7.00, away: 14.00 },

  // ─── Grupo D ──────────────────────────────────────────────────────────
  [key('Estados Unidos', 'Paraguai')]: { home: 2.10, draw: 3.20, away: 3.80 },
  [key('Austrália', 'Turquia')]: { home: 5.20, draw: 3.70, away: 1.69 },
  [key('Turquia', 'Paraguai')]: { home: 2.13, draw: 3.02, away: 3.41 },
  [key('Estados Unidos', 'Austrália')]: { home: 1.63, draw: 4.20, away: 5.10 },
  [key('Turquia', 'Estados Unidos')]: { home: 3.90, draw: 4.20, away: 1.80 },
  [key('Paraguai', 'Austrália')]: { home: 2.90, draw: 2.20, away: 3.90 },

  // ─── Grupo E ──────────────────────────────────────────────────────────
  [key('Alemanha', 'Curaçao')]: { home: 1.03, draw: 17.00, away: 41.00 },
  [key('Costa do Marfim', 'Equador')]: { home: 3.57, draw: 2.90, away: 2.40 },
  [key('Alemanha', 'Costa do Marfim')]: { home: 1.50, draw: 4.60, away: 6.00 },
  [key('Equador', 'Curaçao')]: { home: 1.13, draw: 9.00, away: 21.00 },
  [key('Equador', 'Alemanha')]: { home: 5.10, draw: 4.60, away: 1.57 },
  [key('Curaçao', 'Costa do Marfim')]: { home: 16.00, draw: 7.50, away: 1.17 },

  // ─── Grupo F ──────────────────────────────────────────────────────────
  [key('Holanda', 'Japão')]: { home: 2.03, draw: 3.40, away: 3.70 },
  [key('Suécia', 'Tunísia')]: { home: 1.91, draw: 3.30, away: 4.50 },
  [key('Holanda', 'Suécia')]: { home: 1.71, draw: 3.90, away: 4.70 },
  [key('Tunísia', 'Japão')]: { home: 7.50, draw: 4.60, away: 1.43 },
  [key('Tunísia', 'Holanda')]: { home: 23.00, draw: 8.00, away: 1.13 },
  [key('Japão', 'Suécia')]: { home: 2.00, draw: 3.30, away: 3.90 },

  // ─── Grupo G ──────────────────────────────────────────────────────────
  [key('Bélgica', 'Egito')]: { home: 1.67, draw: 3.80, away: 5.00 },
  [key('Irã', 'Nova Zelândia')]: { home: 1.77, draw: 3.40, away: 5.00 },
  [key('Bélgica', 'Irã')]: { home: 1.43, draw: 4.60, away: 7.50 },
  [key('Nova Zelândia', 'Egito')]: { home: 6.00, draw: 4.00, away: 1.57 },
  [key('Egito', 'Irã')]: { home: 2.45, draw: 2.65, away: 3.70 },
  [key('Nova Zelândia', 'Bélgica')]: { home: 14.00, draw: 7.00, away: 1.18 },

  // ─── Grupo H ──────────────────────────────────────────────────────────
  [key('Espanha', 'Cabo Verde')]: { home: 1.07, draw: 14.00, away: 36.00 },
  [key('Arábia Saudita', 'Uruguai')]: { home: 8.00, draw: 4.40, away: 1.43 },
  [key('Espanha', 'Arábia Saudita')]: { home: 1.09, draw: 12.00, away: 21.00 },
  [key('Uruguai', 'Cabo Verde')]: { home: 1.48, draw: 4.10, away: 7.50 },
  [key('Uruguai', 'Espanha')]: { home: 5.40, draw: 4.00, away: 1.65 },
  [key('Cabo Verde', 'Arábia Saudita')]: { home: 2.65, draw: 3.20, away: 2.75 },

  // ─── Grupo I ──────────────────────────────────────────────────────────
  [key('França', 'Senegal')]: { home: 1.44, draw: 4.50, away: 6.50 },
  [key('Iraque', 'Noruega')]: { home: 13.00, draw: 6.50, away: 1.21 },
  [key('França', 'Iraque')]: { home: 1.07, draw: 13.00, away: 34.00 },
  [key('Noruega', 'Senegal')]: { home: 2.30, draw: 3.30, away: 3.10 },
  [key('Noruega', 'França')]: { home: 7.00, draw: 5.40, away: 1.38 },
  [key('Senegal', 'Iraque')]: { home: 1.22, draw: 6.50, away: 12.00 },

  // ─── Grupo J ──────────────────────────────────────────────────────────
  [key('Argentina', 'Argélia')]: { home: 1.42, draw: 4.50, away: 7.00 },
  [key('Áustria', 'Jordânia')]: { home: 1.33, draw: 5.50, away: 8.00 },
  [key('Argentina', 'Áustria')]: { home: 1.42, draw: 4.50, away: 7.50 },
  [key('Jordânia', 'Argélia')]: { home: 6.00, draw: 4.30, away: 1.51 },
  [key('Jordânia', 'Argentina')]: { home: 119.00, draw: 9.00, away: 1.13 },
  [key('Argélia', 'Áustria')]: { home: 3.90, draw: 2.00, away: 3.20 },

  // ─── Grupo K ──────────────────────────────────────────────────────────
  [key('Portugal', 'RD Congo')]: { home: 1.27, draw: 5.60, away: 12.00 },
  [key('Uzbequistão', 'Colômbia')]: { home: 10.00, draw: 4.70, away: 1.36 },
  [key('Portugal', 'Uzbequistão')]: { home: 1.14, draw: 8.00, away: 20.00 },
  [key('Colômbia', 'RD Congo')]: { home: 1.54, draw: 4.00, away: 6.50 },
  [key('Colômbia', 'Portugal')]: { home: 3.41, draw: 3.17, away: 2.06 },
  [key('RD Congo', 'Uzbequistão')]: { home: 1.69, draw: 3.90, away: 5.10 },

  // ─── Grupo L ──────────────────────────────────────────────────────────
  [key('Inglaterra', 'Croácia')]: { home: 1.69, draw: 3.70, away: 5.40 },
  [key('Gana', 'Panamá')]: { home: 2.35, draw: 3.10, away: 3.20 },
  [key('Inglaterra', 'Gana')]: { home: 1.18, draw: 6.50, away: 15.00 },
  [key('Panamá', 'Croácia')]: { home: 7.00, draw: 4.50, away: 1.45 },
  [key('Panamá', 'Inglaterra')]: { home: 18.00, draw: 8.50, away: 1.14 },
  [key('Croácia', 'Gana')]: { home: 1.56, draw: 3.70, away: 5.47 },

  // ═══ MATA-MATA ════════════════════════════════════════════════════════
  // Odds 1X2 de tempo normal (empate = empate após 90 min, independente de
  // quem venceu nos pênaltis — os pênaltis são resolvidos à parte pelo
  // campo penaltyWinner/pontuação, não pela odd).

  // ─── Rodada de 32 ─────────────────────────────────────────────────────
  [key('África do Sul', 'Canadá')]: { home: 6.00, draw: 3.60, away: 1.65 },
  [key('Alemanha', 'Paraguai')]: { home: 1.31, draw: 5.20, away: 11.00 },
  [key('Brasil', 'Japão')]: { home: 1.74, draw: 3.60, away: 5.10 },
  [key('Holanda', 'Marrocos')]: { home: 2.40, draw: 3.00, away: 3.30 },
  [key('Costa do Marfim', 'Noruega')]: { home: 3.60, draw: 3.30, away: 2.10 },
  [key('França', 'Suécia')]: { home: 1.26, draw: 5.90, away: 12.00 },
  [key('México', 'Equador')]: { home: 2.20, draw: 2.80, away: 4.20 },
  [key('Inglaterra', 'RD Congo')]: { home: 1.27, draw: 5.20, away: 14.00 },
  [key('Bélgica', 'Senegal')]: { home: 2.10, draw: 3.20, away: 3.70 },
  [key('Estados Unidos', 'Bósnia')]: { home: 1.36, draw: 5.00, away: 9.00 },
  [key('Espanha', 'Áustria')]: { home: 1.27, draw: 5.60, away: 12.00 },
  [key('Portugal', 'Croácia')]: { home: 1.77, draw: 2.75, away: 3.65 },
  [key('Suíça', 'Argélia')]: { home: 1.95, draw: 3.10, away: 4.40 },
  [key('Argentina', 'Cabo Verde')]: { home: 1.13, draw: 8.00, away: 21.00 },
  [key('Austrália', 'Egito')]: { home: 3.70, draw: 2.80, away: 2.35 },
  [key('Colômbia', 'Gana')]: { home: 1.42, draw: 4.30, away: 9.00 },

  // ─── Oitavas de Final ─────────────────────────────────────────────────
  [key('Paraguai', 'França')]: { home: 18.00, draw: 6.50, away: 1.18 },
  [key('Canadá', 'Marrocos')]: { home: 5.00, draw: 3.50, away: 1.80 },
  [key('Brasil', 'Noruega')]: { home: 1.77, draw: 3.70, away: 4.70 },
  [key('México', 'Inglaterra')]: { home: 3.10, draw: 3.00, away: 2.50 },
  [key('Portugal', 'Espanha')]: { home: 4.10, draw: 3.50, away: 1.91 },
  [key('Estados Unidos', 'Bélgica')]: { home: 2.50, draw: 3.40, away: 2.80 },
  [key('Argentina', 'Egito')]: { home: 1.32, draw: 4.80, away: 11.00 },
  [key('Suíça', 'Colômbia')]: { home: 3.60, draw: 3.00, away: 2.30 },

  // ─── Quartas de Final ─────────────────────────────────────────────────
  [key('França', 'Marrocos')]: { home: 1.57, draw: 3.80, away: 6.50 },
  [key('Espanha', 'Bélgica')]: { home: 1.63, draw: 3.95, away: 5.50 },
  [key('Noruega', 'Inglaterra')]: { home: 4.10, draw: 3.80, away: 1.83 },
  [key('Argentina', 'Suíça')]: { home: 1.69, draw: 3.60, away: 5.90 },

  // ─── Semifinais ───────────────────────────────────────────────────────
  [key('França', 'Espanha')]: { home: 2.35, draw: 2.90, away: 3.10 },
  [key('Inglaterra', 'Argentina')]: { home: 2.65, draw: 2.90, away: 3.00 },

  // ─── Disputa de 3º Lugar ──────────────────────────────────────────────
  [key('França', 'Inglaterra')]: { home: 1.83, draw: 4.00, away: 3.90 },

  // ─── Final ────────────────────────────────────────────────────────────
  [key('Espanha', 'Argentina')]: { home: 2.25, draw: 2.95, away: 3.60 },
};

export function getRealMatchOdds(homeTeam: string, awayTeam: string): MatchOdds | null {
  return REAL_MATCH_ODDS[key(homeTeam, awayTeam)] ?? null;
}
