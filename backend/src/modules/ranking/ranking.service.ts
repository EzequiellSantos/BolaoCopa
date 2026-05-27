import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { Bet, BetDocument, BetResult } from '../bets/schemas/bet.schema';

export interface RankingEntry {
  position: number;
  userId: string;
  name: string;
  email: string;
  totalPoints: number;
  exactScores: number;   // quantidade de placares exatos (3 pts cada)
  correctWinners: number; // quantidade de vencedores acertados (1 pt cada)
  totalBets: number;
  hitRate: number;        // % de apostas com algum ponto
}

@Injectable()
export class RankingService {
  constructor(
    @InjectModel(Bet.name) private readonly betModel: Model<BetDocument>,
  ) {}

  async getRanking(): Promise<RankingEntry[]> {
    const pipeline: PipelineStage[] = [
      // 1. Apenas apostas já resolvidas (jogo finalizado)
      {
        $match: {
          result: { $in: [BetResult.EXACT, BetResult.WINNER, BetResult.MISS] },
        },
      },

      // 2. Agrupa por usuário somando pontos e contadores
      {
        $group: {
          _id: '$user',
          totalPoints: { $sum: '$points' },
          exactScores: {
            $sum: { $cond: [{ $eq: ['$result', BetResult.EXACT] }, 1, 0] },
          },
          correctWinners: {
            $sum: { $cond: [{ $eq: ['$result', BetResult.WINNER] }, 1, 0] },
          },
          totalBets: { $sum: 1 },
        },
      },

      // 3. Se o usuário estiver armazenado como string, converte para ObjectId
      {
        $addFields: {
          userObjectId: {
            $cond: [
              { $eq: [{ $type: '$_id' }, 'string'] },
              { $toObjectId: '$_id' },
              '$_id',
            ],
          },
        },
      },

      // 4. Popula os dados do usuário
      {
        $lookup: {
          from: 'users',
          localField: 'userObjectId',
          foreignField: '_id',
          as: 'userInfo',
        },
      },

      // 5. Desaninha o array userInfo
      {
        $unwind: '$userInfo',
      },

      // 5. Filtra apenas usuários ativos
      {
        $match: { 'userInfo.isActive': true },
      },

      // 6. Ordena: mais pontos primeiro; empate → mais placares exatos; empate → nome
      {
        $sort: {
          totalPoints: -1,
          exactScores: -1,
          'userInfo.name': 1,
        },
      },

      // 7. Projeta os campos finais
      {
        $project: {
          _id: 0,
          userId: { $toString: '$_id' },
          name: '$userInfo.name',
          email: '$userInfo.email',
          totalPoints: 1,
          exactScores: 1,
          correctWinners: 1,
          totalBets: 1,
          hitRate: {
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
        },
      },
    ];

    const results = await this.betModel.aggregate<Omit<RankingEntry, 'position'>>(pipeline);

    // Adiciona posição numerada (respeitando empates)
    return this.addPositions(results);
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
      // Em caso de empate (mesmos pontos e exatos), mantém a posição anterior
      if (
        index > 0 &&
        entries[index].totalPoints === entries[index - 1].totalPoints &&
        entries[index].exactScores === entries[index - 1].exactScores
      ) {
        return { ...entry, position: entries[index - 1]['position'] ?? position };
      }

      const current = { ...entry, position };
      position = index + 2; // próxima posição pula os empatados
      return current;
    });
  }
}
