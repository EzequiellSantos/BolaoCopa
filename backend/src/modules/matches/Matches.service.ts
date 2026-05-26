import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Match, MatchDocument, MatchStatus } from './schemas/match.schema';
import { Bet, BetDocument } from '../bets/schemas/bet.schema';
import { CreateMatchDto } from './dto/Create-match.dto';
import { UpdateMatchDto } from './dto/Update-match.dto';
import { calculateBetScore } from '../../common/utils/Scoring.util';

@Injectable()
export class MatchesService {
  constructor(
    @InjectModel(Match.name) private readonly matchModel: Model<MatchDocument>,
    @InjectModel(Bet.name) private readonly betModel: Model<BetDocument>,
  ) {}

  // ─── Criar partida ────────────────────────────────────────────────────
  async create(dto: CreateMatchDto): Promise<MatchDocument> {
    const match = new this.matchModel({
      ...dto,
      matchDate: new Date(dto.matchDate),
    });
    return match.save();
  }

  // ─── Listar todas ─────────────────────────────────────────────────────
  async findAll(status?: MatchStatus): Promise<MatchDocument[]> {
    const filter = status ? { status } : {};
    return this.matchModel
      .find(filter)
      .sort({ matchDate: 1 })
      .lean();
  }

  // ─── Listar abertas (para apostas) ───────────────────────────────────
  async findOpen(): Promise<MatchDocument[]> {
    return this.matchModel
      .find({ status: MatchStatus.OPEN })
      .sort({ matchDate: 1 })
      .lean();
  }

  // ─── Buscar por ID ────────────────────────────────────────────────────
  async findById(id: string): Promise<MatchDocument> {
    const match = await this.matchModel.findById(id).lean();
    if (!match) {
      throw new NotFoundException('Partida não encontrada');
    }
    return match;
  }

  // ─── Atualizar dados gerais ───────────────────────────────────────────
  async update(id: string, dto: UpdateMatchDto): Promise<MatchDocument> {
    const match = await this.findById(id);

    // Não permite voltar de FINISHED para outro status
    if (
      match.status === MatchStatus.FINISHED &&
      dto.status &&
      dto.status !== MatchStatus.FINISHED
    ) {
      throw new BadRequestException(
        'Não é possível alterar o status de uma partida já finalizada',
      );
    }

    // Se está finalizando, precisa dos placares e calcula pontuações
    if (dto.status === MatchStatus.FINISHED) {
      if (dto.homeScore === undefined || dto.awayScore === undefined) {
        throw new BadRequestException(
          'Placar obrigatório ao finalizar a partida',
        );
      }

      const updated = await this.matchModel
        .findByIdAndUpdate(
          id,
          {
            status: MatchStatus.FINISHED,
            homeScore: dto.homeScore,
            awayScore: dto.awayScore,
            ...(dto.description && { description: dto.description }),
            ...(dto.stadium && { stadium: dto.stadium }),
          },
          { new: true },
        )
        .lean();

      // Calcula pontuação de todas as apostas dessa partida
      await this.settleBets(id, dto.homeScore, dto.awayScore);

      return updated;
    }

    const updated = await this.matchModel
      .findByIdAndUpdate(id, dto, { new: true })
      .lean();

    return updated;
  }

  // ─── Alterar apenas o status ──────────────────────────────────────────
  async updateStatus(id: string, status: MatchStatus): Promise<MatchDocument> {
    const match = await this.findById(id);

    if (match.status === MatchStatus.FINISHED) {
      throw new BadRequestException(
        'Não é possível alterar o status de uma partida já finalizada',
      );
    }

    if (status === MatchStatus.FINISHED) {
      throw new BadRequestException(
        'Para finalizar uma partida use o endpoint de atualização com os placares',
      );
    }

    return this.matchModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .lean();
  }

  // ─── Remover partida ──────────────────────────────────────────────────
  async remove(id: string): Promise<void> {
    const match = await this.findById(id);

    if (match.status !== MatchStatus.OPEN) {
      throw new BadRequestException(
        'Apenas partidas com status OPEN podem ser removidas',
      );
    }

    await this.matchModel.findByIdAndDelete(id);
    // Remove apostas órfãs associadas
    await this.betModel.deleteMany({ match: id });
  }

  // ─── Calcular pontuação das apostas (chamado ao FINISHED) ─────────────
  private async settleBets(
    matchId: string,
    actualHomeScore: number,
    actualAwayScore: number,
  ): Promise<void> {
    const bets = await this.betModel.find({ match: matchId });

    const updates = bets.map((bet) => {
      const { result, points } = calculateBetScore({
        betHomeScore: bet.homeScore,
        betAwayScore: bet.awayScore,
        actualHomeScore,
        actualAwayScore,
      });

      return this.betModel.findByIdAndUpdate(bet._id, { result, points });
    });

    await Promise.all(updates);
  }
}