import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Bet, BetDocument, BetResult } from './schemas/bet.schema';
import { Match, MatchDocument, MatchStatus } from '../matches/schemas/match.schema';
import { CreateBetDto } from './dto/create-bet.dto';
import { UpdateBetDto } from './dto/update-bet.dto';

@Injectable()
export class BetsService {
  constructor(
    @InjectModel(Bet.name) private readonly betModel: Model<BetDocument>,
    @InjectModel(Match.name) private readonly matchModel: Model<MatchDocument>,
  ) {}

  // ─── Criar aposta ─────────────────────────────────────────────────────
  async create(userId: string, dto: CreateBetDto): Promise<BetDocument> {
    const match = await this.matchModel.findById(dto.matchId).lean();

    if (!match) {
      throw new NotFoundException('Partida não encontrada');
    }

    // Regra: só aceita apostas em partidas OPEN
    if (match.status !== MatchStatus.OPEN) {
      throw new BadRequestException(
        `Esta partida não está aberta para apostas. Status atual: ${match.status}`,
      );
    }

    // Regra: 1 aposta por usuário por partida
    const existing = await this.betModel.findOne({
      user: userId,
      match: dto.matchId,
    });

    if (existing) {
      throw new ConflictException(
        'Você já possui uma aposta para esta partida. Use o endpoint de edição.',
      );
    }

    const bet = new this.betModel({
      user: new Types.ObjectId(userId),
      match: new Types.ObjectId(dto.matchId),
      homeScore: dto.homeScore,
      awayScore: dto.awayScore,
      result: BetResult.PENDING,
      points: 0,
    });

    return (await bet.save()).populate(['user', 'match']);
  }

  // ─── Editar aposta ────────────────────────────────────────────────────
  async update(
    userId: string,
    betId: string,
    dto: UpdateBetDto,
  ): Promise<BetDocument> {
    const bet = await this.betModel
      .findById(betId)
      .populate<{ match: MatchDocument }>('match');

    if (!bet) {
      throw new NotFoundException('Aposta não encontrada');
    }

    // Regra: usuário só edita a própria aposta
    if (String(bet.user) !== userId) {
      throw new BadRequestException('Você não tem permissão para editar esta aposta');
    }

    // Regra: não pode editar após CLOSED ou FINISHED
    const match = bet.match as MatchDocument;
    if (match.status !== MatchStatus.OPEN) {
      throw new BadRequestException(
        `Não é possível editar uma aposta após o fechamento da partida. Status: ${match.status}`,
      );
    }

    const updated = await this.betModel
      .findByIdAndUpdate(betId, dto, { new: true })
      .populate(['user', 'match'])
      .lean();

    return updated;
  }

  // ─── Minhas apostas ───────────────────────────────────────────────────
  async findMyBets(userId: string): Promise<BetDocument[]> {
    return this.betModel
      .find({ user: userId })
      .populate('match')
      .sort({ createdAt: -1 })
      .lean();
  }

  // ─── Aposta por ID ────────────────────────────────────────────────────
  async findById(betId: string, userId: string): Promise<BetDocument> {
    const bet = await this.betModel
      .findById(betId)
      .populate(['user', 'match'])
      .lean();

    if (!bet) {
      throw new NotFoundException('Aposta não encontrada');
    }

    // Após populate, bet.user é um objeto; usamos _id para comparar com o userId
    const betOwnerId =
      bet.user && typeof bet.user === 'object' && '_id' in bet.user
        ? String((bet.user as { _id: unknown })._id)
        : String(bet.user);

    if (betOwnerId !== userId) {
      throw new BadRequestException('Você não tem permissão para ver esta aposta');
    }

    return bet;
  }

  // ─── Apostas de uma partida (ADMIN) ───────────────────────────────────
  async findByMatch(matchId: string): Promise<BetDocument[]> {
    return this.betModel
      .find({ match: matchId })
      .populate('user', 'name email')
      .sort({ createdAt: 1 })
      .lean();
  }

  // ─── Todas as apostas (ADMIN) ─────────────────────────────────────────
  async findAll(): Promise<BetDocument[]> {
    return this.betModel
      .find()
      .populate('user', 'name email')
      .populate('match', 'homeTeam awayTeam matchDate status')
      .sort({ createdAt: -1 })
      .lean();
  }
}