import { calculateBetScore } from './scoring.util';
import { BetResult } from '../../modules/bets/schemas/bet.schema';

describe('calculateBetScore', () => {
  it('deve retornar EXACT e 3 pontos para placar exato', () => {
    const result = calculateBetScore({
      betHomeScore: 2,
      betAwayScore: 1,
      actualHomeScore: 2,
      actualAwayScore: 1,
    });
    expect(result).toEqual({ result: BetResult.EXACT, points: 3 });
  });

  it('deve retornar WINNER e 1 ponto ao acertar o vencedor (casa)', () => {
    const result = calculateBetScore({
      betHomeScore: 1,
      betAwayScore: 0,
      actualHomeScore: 3,
      actualAwayScore: 1,
    });
    expect(result).toEqual({ result: BetResult.WINNER, points: 1 });
  });

  it('deve retornar WINNER e 1 ponto ao acertar o vencedor (visitante)', () => {
    const result = calculateBetScore({
      betHomeScore: 0,
      betAwayScore: 2,
      actualHomeScore: 1,
      actualAwayScore: 3,
    });
    expect(result).toEqual({ result: BetResult.WINNER, points: 1 });
  });

  it('deve retornar WINNER e 1 ponto ao acertar empate', () => {
    const result = calculateBetScore({
      betHomeScore: 0,
      betAwayScore: 0,
      actualHomeScore: 1,
      actualAwayScore: 1,
    });
    expect(result).toEqual({ result: BetResult.WINNER, points: 1 });
  });

  it('deve retornar MISS e 0 pontos ao errar tudo', () => {
    const result = calculateBetScore({
      betHomeScore: 2,
      betAwayScore: 0,
      actualHomeScore: 0,
      actualAwayScore: 1,
    });
    expect(result).toEqual({ result: BetResult.MISS, points: 0 });
  });

  it('deve retornar MISS quando apostou em empate mas houve vencedor', () => {
    const result = calculateBetScore({
      betHomeScore: 1,
      betAwayScore: 1,
      actualHomeScore: 2,
      actualAwayScore: 0,
    });
    expect(result).toEqual({ result: BetResult.MISS, points: 0 });
  });

  // ─── Pênaltis (mata-mata) ─────────────────────────────────────────────

  it('deve retornar PENALTY_WINNER e 5 pontos ao acertar placar e pênaltis', () => {
    const result = calculateBetScore({
      betHomeScore: 1, betAwayScore: 1,
      actualHomeScore: 1, actualAwayScore: 1,
      betPenaltyWinner: 'home', actualPenaltyWinner: 'home',
    });
    expect(result).toEqual({ result: BetResult.PENALTY_WINNER, points: 5 });
  });

  it('deve retornar EXACT e 3 pontos ao acertar placar mas errar pênaltis', () => {
    const result = calculateBetScore({
      betHomeScore: 1, betAwayScore: 1,
      actualHomeScore: 1, actualAwayScore: 1,
      betPenaltyWinner: 'away', actualPenaltyWinner: 'home',
    });
    expect(result).toEqual({ result: BetResult.EXACT, points: 3 });
  });

  it('deve retornar PENALTY_DRAW e 2 pontos ao errar placar mas acertar pênaltis', () => {
    const result = calculateBetScore({
      betHomeScore: 0, betAwayScore: 0,
      actualHomeScore: 1, actualAwayScore: 1,
      betPenaltyWinner: 'away', actualPenaltyWinner: 'away',
    });
    expect(result).toEqual({ result: BetResult.PENALTY_DRAW, points: 2 });
  });

  it('deve retornar WINNER e 1 ponto ao apostar empate com placar errado e pênaltis errado', () => {
    const result = calculateBetScore({
      betHomeScore: 0, betAwayScore: 0,
      actualHomeScore: 1, actualAwayScore: 1,
      betPenaltyWinner: 'home', actualPenaltyWinner: 'away',
    });
    expect(result).toEqual({ result: BetResult.WINNER, points: 1 });
  });

  it('deve retornar MISS ao apostar vencedor quando partida foi para pênaltis', () => {
    const result = calculateBetScore({
      betHomeScore: 2, betAwayScore: 1,
      actualHomeScore: 1, actualAwayScore: 1,
      actualPenaltyWinner: 'home',
    });
    expect(result).toEqual({ result: BetResult.MISS, points: 0 });
  });
});