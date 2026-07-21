import { calculateMatchOdds } from './odds.util';

export type BetDirection = 'home' | 'draw' | 'away';

export const STAKE = 100;

function directionOf(homeScore: number, awayScore: number): BetDirection {
  if (homeScore > awayScore) return 'home';
  if (homeScore < awayScore) return 'away';
  return 'draw';
}

export interface WinningsResult {
  direction: BetDirection;
  actualDirection: BetDirection;
  hit: boolean;
  homeOdd: number;
  drawOdd: number;
  awayOdd: number;
  odd: number;
  stake: number;
  profit: number;
}

/**
 * Calcula quanto uma aposta de R$100 teria rendido, considerando a odd 1X2
 * (casa/empate/fora) estimada para a partida e se o palpite acertou a
 * direção do resultado (não precisa ser o placar exato).
 */
export function calculateBetWinnings(
  bet: { homeScore: number; awayScore: number },
  match: { homeTeam: string; awayTeam: string; homeScore: number; awayScore: number },
  stake: number = STAKE,
): WinningsResult {
  const odds = calculateMatchOdds(match.homeTeam, match.awayTeam);
  const direction = directionOf(bet.homeScore, bet.awayScore);
  const actualDirection = directionOf(match.homeScore, match.awayScore);
  const hit = direction === actualDirection;
  const odd = odds[direction];
  const profit = hit ? Math.round((stake * odd - stake) * 100) / 100 : -stake;

  return {
    direction,
    actualDirection,
    hit,
    homeOdd: odds.home,
    drawOdd: odds.draw,
    awayOdd: odds.away,
    odd,
    stake,
    profit,
  };
}
