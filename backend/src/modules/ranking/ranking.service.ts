import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { Bet, BetDocument, BetResult } from '../bets/schemas/bet.schema';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { MatchDocument, MatchStatus } from '../matches/schemas/match.schema';
import { calculateBetScore } from '../../common/utils/scoring.util';

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

@Injectable()
export class RankingService {
  constructor(
    @InjectModel(Bet.name) private readonly betModel: Model<BetDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async getRanking(): Promise<RankingEntry[]> {
    await this.settlePendingBetsFromFinishedMatches();

    const pipeline: PipelineStage[] = [
      // 1. Todos os usuários ativos e participantes
      {
        $match: { isActive: true, role: UserRole.USER },
      },

      // 2. LEFT JOIN com apostas resolvidas de cada usuário
      {
        $lookup: {
          from: 'bets',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$user', '$$userId'] },
                result: { $in: [BetResult.EXACT, BetResult.WINNER, BetResult.MISS] },
              },
            },
          ],
          as: 'resolvedBets',
        },
      },

      // 3. Calcula métricas (zero para quem não apostou ainda)
      {
        $addFields: {
          totalPoints: { $sum: '$resolvedBets.points' },
          exactScores: {
            $size: {
              $filter: {
                input: '$resolvedBets',
                cond: { $eq: ['$$this.result', BetResult.EXACT] },
              },
            },
          },
          correctWinners: {
            $size: {
              $filter: {
                input: '$resolvedBets',
                cond: { $eq: ['$$this.result', BetResult.WINNER] },
              },
            },
          },
          totalBets: { $size: '$resolvedBets' },
        },
      },

      // 4. Ordena: pontos → exatos → nome
      {
        $sort: {
          totalPoints: -1,
          exactScores: -1,
          name: 1,
        },
      },

      // 5. Projeta campos finais
      {
        $project: {
          _id: 0,
          userId: { $toString: '$_id' },
          name: 1,
          email: 1,
          totalPoints: 1,
          exactScores: 1,
          correctWinners: 1,
          totalBets: 1,
          hitRate: {
            $cond: [
              { $eq: ['$totalBets', 0] },
              0,
              {
                $round: [
                  {
                    $multiply: [
                      {
                        $divide: [
                          { $add: ['$exactScores', '$correctWinners'] },
                          '$totalBets',
                        ],
                      },
                      100,
                    ],
                  },
                  1,
                ],
              },
            ],
          },
        },
      },
    ];

    const results = await this.userModel.aggregate<Omit<RankingEntry, 'position'>>(pipeline);
    return this.addPositions(results);
  }

  private async settlePendingBetsFromFinishedMatches(): Promise<void> {
    const pendingBets = await this.betModel
      .find({ result: BetResult.PENDING })
      .populate<{ match: MatchDocument }>('match')
      .exec();

    const updates = pendingBets
      .map((bet) => {
        const match = bet.match as MatchDocument | null;

        if (
          !match ||
          match.status !== MatchStatus.FINISHED ||
          match.homeScore === null ||
          match.awayScore === null
        ) {
          return null;
        }

        const { result, points } = calculateBetScore({
          betHomeScore: bet.homeScore,
          betAwayScore: bet.awayScore,
          actualHomeScore: match.homeScore,
          actualAwayScore: match.awayScore,
        });

        return this.betModel.findByIdAndUpdate(bet._id, { result, points });
      })
      .filter(Boolean);

    await Promise.all(updates);
  }

  // ─── Ranking de um usuário específico ────────────────────────────────
  async getUserRanking(userId: string): Promise<{
    entry: RankingEntry | null;
    position: number | null;
  }> {
    const ranking = await this.getRanking();
    const entry = ranking.find((r) => r.userId === userId) ?? null;
    const position = entry ? entry.position : null;
    return { entry, position };
  }

  // ─── Adiciona posições com suporte a empate ───────────────────────────
  private addPositions(entries: Omit<RankingEntry, 'position'>[]): RankingEntry[] {
    let position = 1;

    return entries.map((entry, index) => {
      if (
        index > 0 &&
        entries[index].totalPoints === entries[index - 1].totalPoints &&
        entries[index].exactScores === entries[index - 1].exactScores
      ) {
        return { ...entry, position: entries[index - 1]['position'] ?? position };
      }

      const current = { ...entry, position };
      position = index + 2;
      return current;
    });
  }
}
