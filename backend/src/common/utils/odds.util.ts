import { getRealMatchOdds } from './real-match-odds.data';

// Força estimada de cada seleção (0-100), baseada em desempenho histórico e
// ranking real de futebol. Não são odds de mercado — servem para simular
// odds 1X2 plausíveis para as partidas (fictícias) desta Copa do bolão.
export const TEAM_STRENGTH: Record<string, number> = {
  'Argentina': 95,
  'França': 93,
  'Espanha': 92,
  'Brasil': 90,
  'Inglaterra': 88,
  'Portugal': 86,
  'Holanda': 85,
  'Alemanha': 84,
  'Bélgica': 82,
  'Marrocos': 80,
  'Uruguai': 79,
  'Croácia': 78,
  'Colômbia': 77,
  'Suíça': 76,
  'Senegal': 75,
  'Estados Unidos': 74,
  'Japão': 74,
  'México': 73,
  'Áustria': 73,
  'Coreia do Sul': 72,
  'Noruega': 71,
  'Turquia': 70,
  'Equador': 69,
  'Argélia': 68,
  'Egito': 68,
  'Suécia': 68,
  'Canadá': 68,
  'Escócia': 66,
  'Costa do Marfim': 65,
  'Irã': 64,
  'Tunísia': 63,
  'Austrália': 62,
  'República Tcheca': 61,
  'Paraguai': 60,
  'Gana': 58,
  'Bósnia': 58,
  'Arábia Saudita': 55,
  'Panamá': 55,
  'África do Sul': 54,
  'Qatar': 52,
  'Iraque': 52,
  'Nova Zelândia': 50,
  'Uzbequistão': 50,
  'Cabo Verde': 48,
  'Jordânia': 47,
  'RD Congo': 46,
  'Haiti': 44,
  'Curaçao': 42,
};

const DEFAULT_STRENGTH = 50;
const HOME_ADVANTAGE = 5;
const OVERROUND = 1.07; // margem típica de casa de apostas (~7%)
const MIN_ODD = 1.01;

export interface MatchOdds {
  home: number;
  draw: number;
  away: number;
}

function strengthOf(team: string): number {
  return TEAM_STRENGTH[team] ?? DEFAULT_STRENGTH;
}

function toOdd(probability: number): number {
  const fair = 1 / (probability * OVERROUND);
  return Math.max(MIN_ODD, Math.round(fair * 100) / 100);
}

/**
 * Odds 1X2 (casa/empate/fora) de uma partida. Sempre que o confronto tem
 * odds reais de mercado catalogadas (ver real-match-odds.data.ts — cobre as
 * 104 partidas reais da Copa 2026), usa a odd real. Caso contrário (ex:
 * algum confronto não catalogado), estima a odd a partir da força das duas
 * seleções: quanto maior a diferença de força, mais desequilibrada fica a
 * odd e menor a probabilidade de empate.
 */
export function calculateMatchOdds(homeTeam: string, awayTeam: string): MatchOdds {
  const real = getRealMatchOdds(homeTeam, awayTeam);
  if (real) return real;

  const diff = strengthOf(homeTeam) + HOME_ADVANTAGE - strengthOf(awayTeam);

  const drawProb = Math.min(0.3, Math.max(0.16, 0.28 - Math.abs(diff) * 0.0025));
  const homeShare = 1 / (1 + Math.pow(10, -diff / 50));
  const remaining = 1 - drawProb;

  const homeProb = remaining * homeShare;
  const awayProb = remaining * (1 - homeShare);

  return {
    home: toOdd(homeProb),
    draw: toOdd(drawProb),
    away: toOdd(awayProb),
  };
}
