import { calculateBetScore } from './scoring.util';
import { BetResult } from '../../bets/schemas/bet.schema';

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
});