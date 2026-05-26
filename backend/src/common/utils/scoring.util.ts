import { BetResult } from '../../modules/bets/schemas/bet.schema';

interface ScoreInput {
  betHomeScore: number;
  betAwayScore: number;
  actualHomeScore: number;
  actualAwayScore: number;
}

interface ScoreOutput {
  result: BetResult;
  points: number;
}

/**
 * Calcula o resultado e os pontos de uma aposta com base no resultado real.
 *
 * Regras de negócio:
 *  - Placar exato  → 3 pontos  (BetResult.EXACT)
 *  - Acertou vencedor/empate → 1 ponto (BetResult.WINNER)
 *  - Errou tudo → 0 pontos (BetResult.MISS)
 */
export function calculateBetScore(input: ScoreInput): ScoreOutput {
  const { betHomeScore, betAwayScore, actualHomeScore, actualAwayScore } = input;

  // ─── Placar exato ─────────────────────────────────────────────────────
  if (betHomeScore === actualHomeScore && betAwayScore === actualAwayScore) {
    return { result: BetResult.EXACT, points: 3 };
  }

  // ─── Acertou o vencedor ou empate ────────────────────────────────────
  const betWinner = getWinner(betHomeScore, betAwayScore);
  const actualWinner = getWinner(actualHomeScore, actualAwayScore);

  if (betWinner === actualWinner) {
    return { result: BetResult.WINNER, points: 1 };
  }

  // ─── Erro total ───────────────────────────────────────────────────────
  return { result: BetResult.MISS, points: 0 };
}

/**
 * Retorna 'home' | 'away' | 'draw' com base nos placares.
 */
function getWinner(homeScore: number, awayScore: number): 'home' | 'away' | 'draw' {
  if (homeScore > awayScore) return 'home';
  if (awayScore > homeScore) return 'away';
  return 'draw';
}