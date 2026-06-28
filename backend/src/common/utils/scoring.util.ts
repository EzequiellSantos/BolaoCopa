import { BetResult } from '../../modules/bets/schemas/bet.schema';

interface ScoreInput {
  betHomeScore: number;
  betAwayScore: number;
  actualHomeScore: number;
  actualAwayScore: number;
  betPenaltyWinner?: 'home' | 'away' | null;
  actualPenaltyWinner?: 'home' | 'away' | null;
}

interface ScoreOutput {
  result: BetResult;
  points: number;
}

/**
 * Regras de negócio:
 *
 * Mata-mata com pênaltis (actualPenaltyWinner definido):
 *  - Placar exato do empate + acertou quem venceu pênaltis → 5 pts (PENALTY_WINNER)
 *  - Placar exato do empate + errou pênaltis               → 3 pts (EXACT)
 *  - Apostou empate (qualquer placar) + foi pênaltis       → 1 pt  (WINNER)
 *  - Apostou vencedor mas foi pênaltis                     → 0 pts (MISS)
 *
 * Partida normal:
 *  - Placar exato  → 3 pts (EXACT)
 *  - Vencedor/empate correto → 1 pt (WINNER)
 *  - Errou → 0 pts (MISS)
 */
export function calculateBetScore(input: ScoreInput): ScoreOutput {
  const {
    betHomeScore, betAwayScore,
    actualHomeScore, actualAwayScore,
    betPenaltyWinner, actualPenaltyWinner,
  } = input;

  // ─── Mata-mata que foi pra pênaltis ───────────────────────────────────
  if (actualPenaltyWinner) {
    const betIsDraw = betHomeScore === betAwayScore;

    if (!betIsDraw) {
      return { result: BetResult.MISS, points: 0 };
    }

    const betExact = betHomeScore === actualHomeScore && betAwayScore === actualAwayScore;

    if (betExact && betPenaltyWinner === actualPenaltyWinner) {
      return { result: BetResult.PENALTY_WINNER, points: 5 };
    }

    if (betExact) {
      return { result: BetResult.EXACT, points: 3 };
    }

    if (betPenaltyWinner === actualPenaltyWinner) {
      return { result: BetResult.PENALTY_DRAW, points: 2 };
    }

    return { result: BetResult.WINNER, points: 1 };
  }

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

function getWinner(homeScore: number, awayScore: number): 'home' | 'away' | 'draw' {
  if (homeScore > awayScore) return 'home';
  if (awayScore > homeScore) return 'away';
  return 'draw';
}