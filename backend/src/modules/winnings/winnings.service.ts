import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Bet, BetDocument } from '../bets/schemas/bet.schema';
import { Match, MatchDocument, MatchStatus } from '../matches/schemas/match.schema';
import { calculateBetWinnings, STAKE } from '../../common/utils/winnings.util';

export interface WinningsMatchBreakdown {
  matchId: string;
  matchDate: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  description?: string;
  betHomeScore: number;
  betAwayScore: number;
  homeOdd: number;
  drawOdd: number;
  awayOdd: number;
  odd: number;
  hit: boolean;
  stake: number;
  profit: number;
}

export interface WinningsSummary {
  totalBets: number;
  hits: number;
  hitRate: number;
  totalStaked: number;
  netProfit: number;
}

@Injectable()
export class WinningsService {
  constructor(
    @InjectModel(Bet.name) private readonly betModel: Model<BetDocument>,
    @InjectModel(Match.name) private readonly matchModel: Model<MatchDocument>,
  ) {}

  private async getFinishedMatchesById(): Promise<Map<string, MatchDocument>> {
    const matches = await this.matchModel
      .find({ status: MatchStatus.FINISHED, homeScore: { $ne: null }, awayScore: { $ne: null } })
      .lean();

    return new Map(matches.map((m) => [String(m._id), m as unknown as MatchDocument]));
  }

  async getUserWinnings(userId: string): Promise<{
    summary: WinningsSummary | null;
    matches: WinningsMatchBreakdown[];
  }> {
    const matchesById = await this.getFinishedMatchesById();
    const matchObjectIds = [...matchesById.keys()].map((id) => new Types.ObjectId(id));

    const bets = await this.betModel
      .find({ user: new Types.ObjectId(userId), match: { $in: matchObjectIds } })
      .lean();

    const breakdown: WinningsMatchBreakdown[] = [];
    let hits = 0;
    let netProfit = 0;

    for (const bet of bets) {
      const match = matchesById.get(String(bet.match));
      if (!match) continue;

      const result = calculateBetWinnings(bet, match);
      if (result.hit) hits += 1;
      netProfit += result.profit;

      breakdown.push({
        matchId: String(match._id),
        matchDate: (match.matchDate as unknown as Date).toISOString(),
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        homeScore: match.homeScore as number,
        awayScore: match.awayScore as number,
        description: match.description,
        betHomeScore: bet.homeScore,
        betAwayScore: bet.awayScore,
        homeOdd: result.homeOdd,
        drawOdd: result.drawOdd,
        awayOdd: result.awayOdd,
        odd: result.odd,
        hit: result.hit,
        stake: result.stake,
        profit: result.profit,
      });
    }

    breakdown.sort((a, b) => a.matchDate.localeCompare(b.matchDate));

    const totalBets = breakdown.length;

    if (totalBets === 0) {
      return { summary: null, matches: breakdown };
    }

    const summary: WinningsSummary = {
      totalBets,
      hits,
      hitRate: Math.round((hits / totalBets) * 1000) / 10,
      totalStaked: totalBets * STAKE,
      netProfit: Math.round(netProfit * 100) / 100,
    };

    return { summary, matches: breakdown };
  }
}
