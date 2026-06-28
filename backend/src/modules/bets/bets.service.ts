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

  private isDuplicateKeyError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    );
  }

  // ─── Criar aposta ─────────────────────────────────────────────────────
  async create(userId: string, dto: CreateBetDto): Promise<BetDocument> {
    const match = await this.matchModel.findById(dto.matchId).lean();

    if (!match) {
      throw new NotFoundException('Partida não encontrada');
    }

    if (match.status !== MatchStatus.OPEN) {
      throw new BadRequestException(
        `Esta partida não está aberta para apostas. Status atual: ${match.status}`,
      );
    }

    const userObjectId = new Types.ObjectId(userId);
    const matchObjectId = new Types.ObjectId(dto.matchId);

    const existing = await this.betModel.findOne({
      user: userObjectId,
      match: matchObjectId,
    });

    if (existing) {
      throw new ConflictException(
        'Você já possui uma aposta para esta partida. Use o endpoint de edição.',
      );
    }

    const bet = new this.betModel({
      user: userObjectId,
      match: matchObjectId,
      homeScore: dto.homeScore,
      awayScore: dto.awayScore,
      penaltyWinner: dto.penaltyWinner ?? null,
      result: BetResult.PENDING,
      points: 0,
    });

    try {
      return (await bet.save()).populate(['user', 'match']);
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          'Você já possui uma aposta para esta partida.',
        );
      }
      throw error;
    }
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

    if (String(bet.user) !== userId) {
      throw new BadRequestException('Você não tem permissão para editar esta aposta');
    }

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
    const bets = await this.betModel
      .find({ user: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();

    return bets.map((bet) => ({
      ...bet,
      _id: String(bet._id),
      user: String(bet.user),
      match: String(bet.match),
    })) as unknown as BetDocument[];
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

    const betOwnerId =
      bet.user && typeof bet.user === 'object' && '_id' in bet.user
        ? String((bet.user as { _id: unknown })._id)
        : String(bet.user);

    if (betOwnerId !== userId) {
      throw new BadRequestException('Você não tem permissão para ver esta aposta');
    }

    return bet;
  }

  // ─── Palpites de uma partida — visão pública (qualquer usuário logado) ──
  // Só libera depois que a partida sai de OPEN, para não revelar
  // palpites de outros usuários antes do fechamento das apostas.
  async findPicksForMatch(matchId: string): Promise<BetDocument[]> {

    const match = await this.matchModel.findById(matchId).lean();

    if (!match) {
      throw new NotFoundException('Partida não encontrada');
    }


    if (match.status === MatchStatus.OPEN) {
      throw new BadRequestException(
        'Os palpites desta partida ainda não foram revelados.',
      );
    }


    const bets = await this.betModel
      .find({
        match: new Types.ObjectId(matchId),
      })
      .populate('user', 'name')
      .sort({
        points: -1,
        createdAt: 1,
      })
      .lean();


    return bets as unknown as BetDocument[];
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