import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Match, MatchDocument, MatchStatus } from './schemas/match.schema';

interface MatchSeed {
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  description: string;
  stadium: string;
  status?: MatchStatus;
}

// Horários convertidos de Brasília (BRT = UTC-3) para UTC (+3h)
const COPA_2026_MATCHES: MatchSeed[] = [
  // ─── FASE DE GRUPOS – Rodada 1 ────────────────────────────────────────
  // Quinta-feira, 11 de junho
  { homeTeam: 'México',           awayTeam: 'África do Sul',    matchDate: '2026-06-11T19:00:00.000Z', description: 'Grupo A', stadium: 'Cidade do México' },
  { homeTeam: 'Coreia do Sul',    awayTeam: 'República Tcheca', matchDate: '2026-06-12T02:00:00.000Z', description: 'Grupo A', stadium: 'Guadalajara' },
  // Sexta-feira, 12 de junho
  { homeTeam: 'Canadá',           awayTeam: 'Bósnia',           matchDate: '2026-06-12T19:00:00.000Z', description: 'Grupo B', stadium: 'Toronto' },
  { homeTeam: 'Estados Unidos',   awayTeam: 'Paraguai',         matchDate: '2026-06-13T01:00:00.000Z', description: 'Grupo D', stadium: 'Los Angeles' },
  // Sábado, 13 de junho
  { homeTeam: 'Austrália',        awayTeam: 'Turquia',          matchDate: '2026-06-13T04:00:00.000Z', description: 'Grupo D', stadium: 'Vancouver' },
  { homeTeam: 'Qatar',            awayTeam: 'Suíça',            matchDate: '2026-06-13T19:00:00.000Z', description: 'Grupo B', stadium: 'San Francisco' },
  { homeTeam: 'Brasil',           awayTeam: 'Marrocos',         matchDate: '2026-06-13T22:00:00.000Z', description: 'Grupo C', stadium: 'Nova York' },
  { homeTeam: 'Haiti',            awayTeam: 'Escócia',          matchDate: '2026-06-14T01:00:00.000Z', description: 'Grupo C', stadium: 'Boston' },
  // Domingo, 14 de junho
  { homeTeam: 'Alemanha',         awayTeam: 'Curaçao',          matchDate: '2026-06-14T17:00:00.000Z', description: 'Grupo E', stadium: 'Houston' },
  { homeTeam: 'Holanda',          awayTeam: 'Japão',            matchDate: '2026-06-14T20:00:00.000Z', description: 'Grupo F', stadium: 'Dallas' },
  { homeTeam: 'Costa do Marfim',  awayTeam: 'Equador',          matchDate: '2026-06-14T23:00:00.000Z', description: 'Grupo E', stadium: 'Filadélfia' },
  { homeTeam: 'Suécia',           awayTeam: 'Tunísia',          matchDate: '2026-06-15T02:00:00.000Z', description: 'Grupo F', stadium: 'Monterrey' },
  // Segunda-feira, 15 de junho
  { homeTeam: 'Espanha',          awayTeam: 'Cabo Verde',       matchDate: '2026-06-15T16:00:00.000Z', description: 'Grupo H', stadium: 'Atlanta' },
  { homeTeam: 'Bélgica',          awayTeam: 'Egito',            matchDate: '2026-06-15T19:00:00.000Z', description: 'Grupo G', stadium: 'Seattle' },
  { homeTeam: 'Arábia Saudita',   awayTeam: 'Uruguai',          matchDate: '2026-06-15T22:00:00.000Z', description: 'Grupo H', stadium: 'Miami' },
  { homeTeam: 'Irã',              awayTeam: 'Nova Zelândia',    matchDate: '2026-06-16T01:00:00.000Z', description: 'Grupo G', stadium: 'Los Angeles' },
  // Terça-feira, 16 de junho
  { homeTeam: 'França',           awayTeam: 'Senegal',          matchDate: '2026-06-16T19:00:00.000Z', description: 'Grupo I', stadium: 'Nova York' },
  { homeTeam: 'Iraque',           awayTeam: 'Noruega',          matchDate: '2026-06-16T22:00:00.000Z', description: 'Grupo I', stadium: 'Boston' },
  { homeTeam: 'Argentina',        awayTeam: 'Argélia',          matchDate: '2026-06-17T01:00:00.000Z', description: 'Grupo J', stadium: 'Kansas City' },
  // Quarta-feira, 17 de junho
  { homeTeam: 'Áustria',          awayTeam: 'Jordânia',         matchDate: '2026-06-17T04:00:00.000Z', description: 'Grupo J', stadium: 'San Francisco' },
  { homeTeam: 'Portugal',         awayTeam: 'RD Congo',         matchDate: '2026-06-17T17:00:00.000Z', description: 'Grupo K', stadium: 'Houston' },
  { homeTeam: 'Inglaterra',       awayTeam: 'Croácia',          matchDate: '2026-06-17T20:00:00.000Z', description: 'Grupo L', stadium: 'Dallas' },
  { homeTeam: 'Gana',             awayTeam: 'Panamá',           matchDate: '2026-06-17T23:00:00.000Z', description: 'Grupo L', stadium: 'Toronto' },
  { homeTeam: 'Uzbequistão',      awayTeam: 'Colômbia',         matchDate: '2026-06-18T02:00:00.000Z', description: 'Grupo K', stadium: 'Cidade do México' },

  // ─── FASE DE GRUPOS – Rodada 2 ────────────────────────────────────────
  // Quinta-feira, 18 de junho
  { homeTeam: 'República Tcheca', awayTeam: 'África do Sul',    matchDate: '2026-06-18T16:00:00.000Z', description: 'Grupo A', stadium: 'Atlanta' },
  { homeTeam: 'Suíça',            awayTeam: 'Bósnia',           matchDate: '2026-06-18T19:00:00.000Z', description: 'Grupo B', stadium: 'Los Angeles' },
  { homeTeam: 'Canadá',           awayTeam: 'Qatar',            matchDate: '2026-06-18T22:00:00.000Z', description: 'Grupo B', stadium: 'Vancouver' },
  { homeTeam: 'México',           awayTeam: 'Coreia do Sul',    matchDate: '2026-06-19T01:00:00.000Z', description: 'Grupo A', stadium: 'Guadalajara' },
  // Sexta-feira, 19 de junho
  { homeTeam: 'Turquia',          awayTeam: 'Paraguai',         matchDate: '2026-06-19T04:00:00.000Z', description: 'Grupo D', stadium: 'San Francisco' },
  { homeTeam: 'Estados Unidos',   awayTeam: 'Austrália',        matchDate: '2026-06-19T19:00:00.000Z', description: 'Grupo D', stadium: 'Seattle' },
  { homeTeam: 'Escócia',          awayTeam: 'Marrocos',         matchDate: '2026-06-19T22:00:00.000Z', description: 'Grupo C', stadium: 'Boston' },
  { homeTeam: 'Brasil',           awayTeam: 'Haiti',            matchDate: '2026-06-20T01:00:00.000Z', description: 'Grupo C', stadium: 'Filadélfia' },
  // Sábado, 20 de junho
  { homeTeam: 'Holanda',          awayTeam: 'Suécia',           matchDate: '2026-06-20T17:00:00.000Z', description: 'Grupo F', stadium: 'Houston' },
  { homeTeam: 'Alemanha',         awayTeam: 'Costa do Marfim',  matchDate: '2026-06-20T20:00:00.000Z', description: 'Grupo E', stadium: 'Toronto' },
  { homeTeam: 'Equador',          awayTeam: 'Curaçao',          matchDate: '2026-06-21T00:00:00.000Z', description: 'Grupo E', stadium: 'Kansas City' },
  // Domingo, 21 de junho
  { homeTeam: 'Tunísia',          awayTeam: 'Japão',            matchDate: '2026-06-21T04:00:00.000Z', description: 'Grupo F', stadium: 'Monterrey' },
  { homeTeam: 'Espanha',          awayTeam: 'Arábia Saudita',   matchDate: '2026-06-21T16:00:00.000Z', description: 'Grupo H', stadium: 'Atlanta' },
  { homeTeam: 'Bélgica',          awayTeam: 'Irã',              matchDate: '2026-06-21T19:00:00.000Z', description: 'Grupo G', stadium: 'Los Angeles' },
  { homeTeam: 'Uruguai',          awayTeam: 'Cabo Verde',       matchDate: '2026-06-21T22:00:00.000Z', description: 'Grupo H', stadium: 'Miami' },
  { homeTeam: 'Nova Zelândia',    awayTeam: 'Egito',            matchDate: '2026-06-22T01:00:00.000Z', description: 'Grupo G', stadium: 'Vancouver' },
  // Segunda-feira, 22 de junho
  { homeTeam: 'Argentina',        awayTeam: 'Áustria',          matchDate: '2026-06-22T17:00:00.000Z', description: 'Grupo J', stadium: 'Dallas' },
  { homeTeam: 'França',           awayTeam: 'Iraque',           matchDate: '2026-06-22T21:00:00.000Z', description: 'Grupo I', stadium: 'Filadélfia' },
  { homeTeam: 'Noruega',          awayTeam: 'Senegal',          matchDate: '2026-06-23T00:00:00.000Z', description: 'Grupo I', stadium: 'Nova York' },
  // Terça-feira, 23 de junho
  { homeTeam: 'Jordânia',         awayTeam: 'Argélia',          matchDate: '2026-06-23T03:00:00.000Z', description: 'Grupo J', stadium: 'San Francisco' },
  { homeTeam: 'Portugal',         awayTeam: 'Uzbequistão',      matchDate: '2026-06-23T17:00:00.000Z', description: 'Grupo K', stadium: 'Houston' },
  { homeTeam: 'Inglaterra',       awayTeam: 'Gana',             matchDate: '2026-06-23T20:00:00.000Z', description: 'Grupo L', stadium: 'Boston' },
  { homeTeam: 'Panamá',           awayTeam: 'Croácia',          matchDate: '2026-06-23T23:00:00.000Z', description: 'Grupo L', stadium: 'Toronto' },
  { homeTeam: 'Colômbia',         awayTeam: 'RD Congo',         matchDate: '2026-06-24T02:00:00.000Z', description: 'Grupo K', stadium: 'Guadalajara' },

  // ─── FASE DE GRUPOS – Rodada 3 (simultâneos por grupo) ───────────────
  // Quarta-feira, 24 de junho
  { homeTeam: 'Suíça',            awayTeam: 'Canadá',           matchDate: '2026-06-24T19:00:00.000Z', description: 'Grupo B', stadium: 'Vancouver' },
  { homeTeam: 'Bósnia',           awayTeam: 'Qatar',            matchDate: '2026-06-24T19:00:00.000Z', description: 'Grupo B', stadium: 'Seattle' },
  { homeTeam: 'Escócia',          awayTeam: 'Brasil',           matchDate: '2026-06-24T22:00:00.000Z', description: 'Grupo C', stadium: 'Miami' },
  { homeTeam: 'Marrocos',         awayTeam: 'Haiti',            matchDate: '2026-06-24T22:00:00.000Z', description: 'Grupo C', stadium: 'Atlanta' },
  { homeTeam: 'República Tcheca', awayTeam: 'México',           matchDate: '2026-06-25T01:00:00.000Z', description: 'Grupo A', stadium: 'Cidade do México' },
  { homeTeam: 'África do Sul',    awayTeam: 'Coreia do Sul',    matchDate: '2026-06-25T01:00:00.000Z', description: 'Grupo A', stadium: 'Monterrey' },
  // Quinta-feira, 25 de junho
  { homeTeam: 'Equador',          awayTeam: 'Alemanha',         matchDate: '2026-06-25T20:00:00.000Z', description: 'Grupo E', stadium: 'Nova York' },
  { homeTeam: 'Curaçao',          awayTeam: 'Costa do Marfim',  matchDate: '2026-06-25T20:00:00.000Z', description: 'Grupo E', stadium: 'Filadélfia' },
  { homeTeam: 'Tunísia',          awayTeam: 'Holanda',          matchDate: '2026-06-25T23:00:00.000Z', description: 'Grupo F', stadium: 'Kansas City' },
  { homeTeam: 'Japão',            awayTeam: 'Suécia',           matchDate: '2026-06-25T23:00:00.000Z', description: 'Grupo F', stadium: 'Dallas' },
  { homeTeam: 'Turquia',          awayTeam: 'Estados Unidos',   matchDate: '2026-06-26T02:00:00.000Z', description: 'Grupo D', stadium: 'Los Angeles' },
  { homeTeam: 'Paraguai',         awayTeam: 'Austrália',        matchDate: '2026-06-26T02:00:00.000Z', description: 'Grupo D', stadium: 'San Francisco' },
  // Sexta-feira, 26 de junho
  { homeTeam: 'Noruega',          awayTeam: 'França',           matchDate: '2026-06-26T19:00:00.000Z', description: 'Grupo I', stadium: 'Boston' },
  { homeTeam: 'Senegal',          awayTeam: 'Iraque',           matchDate: '2026-06-26T19:00:00.000Z', description: 'Grupo I', stadium: 'Toronto' },
  { homeTeam: 'Uruguai',          awayTeam: 'Espanha',          matchDate: '2026-06-27T00:00:00.000Z', description: 'Grupo H', stadium: 'Guadalajara' },
  { homeTeam: 'Cabo Verde',       awayTeam: 'Arábia Saudita',   matchDate: '2026-06-27T00:00:00.000Z', description: 'Grupo H', stadium: 'Houston' },
  { homeTeam: 'Egito',            awayTeam: 'Irã',              matchDate: '2026-06-27T03:00:00.000Z', description: 'Grupo G', stadium: 'Seattle' },
  { homeTeam: 'Nova Zelândia',    awayTeam: 'Bélgica',          matchDate: '2026-06-27T03:00:00.000Z', description: 'Grupo G', stadium: 'Vancouver' },
  // Sábado, 27 de junho
  { homeTeam: 'Panamá',           awayTeam: 'Inglaterra',       matchDate: '2026-06-27T21:00:00.000Z', description: 'Grupo L', stadium: 'Nova York' },
  { homeTeam: 'Croácia',          awayTeam: 'Gana',             matchDate: '2026-06-27T21:00:00.000Z', description: 'Grupo L', stadium: 'Filadélfia' },
  { homeTeam: 'Colômbia',         awayTeam: 'Portugal',         matchDate: '2026-06-28T00:30:00.000Z', description: 'Grupo K', stadium: 'Miami' },
  { homeTeam: 'RD Congo',         awayTeam: 'Uzbequistão',      matchDate: '2026-06-28T00:30:00.000Z', description: 'Grupo K', stadium: 'Atlanta' },
  { homeTeam: 'Jordânia',         awayTeam: 'Argentina',        matchDate: '2026-06-28T02:00:00.000Z', description: 'Grupo J', stadium: 'Dallas' },
  { homeTeam: 'Argélia',          awayTeam: 'Áustria',          matchDate: '2026-06-28T02:00:00.000Z', description: 'Grupo J', stadium: 'Kansas City' },

  // ─── MATA-MATA (32 AVOS) ─────────────────────────────────────────────
  // Domingo, 28 de junho
  { homeTeam: 'A Definir', awayTeam: 'A Definir', matchDate: '2026-06-28T19:00:00.000Z', description: 'Jogo 73 – Mata-mata',       stadium: 'Los Angeles',    status: MatchStatus.CLOSED },
  // Segunda-feira, 29 de junho
  { homeTeam: 'A Definir', awayTeam: 'A Definir', matchDate: '2026-06-29T17:00:00.000Z', description: 'Jogo 76 – Mata-mata',       stadium: 'Houston',        status: MatchStatus.CLOSED },
  { homeTeam: 'A Definir', awayTeam: 'A Definir', matchDate: '2026-06-29T20:30:00.000Z', description: 'Jogo 74 – Mata-mata',       stadium: 'Boston',         status: MatchStatus.CLOSED },
  { homeTeam: 'A Definir', awayTeam: 'A Definir', matchDate: '2026-06-30T01:00:00.000Z', description: 'Jogo 75 – Mata-mata',       stadium: 'Monterrey',      status: MatchStatus.CLOSED },
  // Terça-feira, 30 de junho
  { homeTeam: 'A Definir', awayTeam: 'A Definir', matchDate: '2026-06-30T17:00:00.000Z', description: 'Jogo 78 – Mata-mata',       stadium: 'Dallas',         status: MatchStatus.CLOSED },
  { homeTeam: 'A Definir', awayTeam: 'A Definir', matchDate: '2026-06-30T21:00:00.000Z', description: 'Jogo 77 – Mata-mata',       stadium: 'Nova York',      status: MatchStatus.CLOSED },
  { homeTeam: 'A Definir', awayTeam: 'A Definir', matchDate: '2026-07-01T01:00:00.000Z', description: 'Jogo 79 – Mata-mata',       stadium: 'Cidade do México', status: MatchStatus.CLOSED },
  // Quarta-feira, 1 de julho
  { homeTeam: 'A Definir', awayTeam: 'A Definir', matchDate: '2026-07-01T16:00:00.000Z', description: 'Jogo 80 – Mata-mata',       stadium: 'Atlanta',        status: MatchStatus.CLOSED },
  { homeTeam: 'A Definir', awayTeam: 'A Definir', matchDate: '2026-07-01T20:00:00.000Z', description: 'Jogo 82 – Mata-mata',       stadium: 'Seattle',        status: MatchStatus.CLOSED },
  { homeTeam: 'A Definir', awayTeam: 'A Definir', matchDate: '2026-07-02T00:00:00.000Z', description: 'Jogo 81 – Mata-mata',       stadium: 'San Francisco',  status: MatchStatus.CLOSED },
  // Quinta-feira, 2 de julho
  { homeTeam: 'A Definir', awayTeam: 'A Definir', matchDate: '2026-07-02T19:00:00.000Z', description: 'Jogo 84 – Mata-mata',       stadium: 'Los Angeles',    status: MatchStatus.CLOSED },
  { homeTeam: 'A Definir', awayTeam: 'A Definir', matchDate: '2026-07-02T23:00:00.000Z', description: 'Jogo 83 – Mata-mata',       stadium: 'Toronto',        status: MatchStatus.CLOSED },
  { homeTeam: 'A Definir', awayTeam: 'A Definir', matchDate: '2026-07-03T03:00:00.000Z', description: 'Jogo 85 – Mata-mata',       stadium: 'Vancouver',      status: MatchStatus.CLOSED },
  // Sexta-feira, 3 de julho
  { homeTeam: 'A Definir', awayTeam: 'A Definir', matchDate: '2026-07-03T18:00:00.000Z', description: 'Jogo 88 – Mata-mata',       stadium: 'Dallas',         status: MatchStatus.CLOSED },
  { homeTeam: 'A Definir', awayTeam: 'A Definir', matchDate: '2026-07-03T22:00:00.000Z', description: 'Jogo 86 – Mata-mata',       stadium: 'Miami',          status: MatchStatus.CLOSED },
  { homeTeam: 'A Definir', awayTeam: 'A Definir', matchDate: '2026-07-04T01:30:00.000Z', description: 'Jogo 87 – Mata-mata',       stadium: 'Kansas City',    status: MatchStatus.CLOSED },

  // ─── OITAVAS DE FINAL ────────────────────────────────────────────────
  // Sábado, 4 de julho
  { homeTeam: 'A Definir', awayTeam: 'A Definir', matchDate: '2026-07-04T17:00:00.000Z', description: 'Jogo 90 – Oitavas de Final', stadium: 'Houston',       status: MatchStatus.CLOSED },
  { homeTeam: 'A Definir', awayTeam: 'A Definir', matchDate: '2026-07-04T21:00:00.000Z', description: 'Jogo 89 – Oitavas de Final', stadium: 'Filadélfia',    status: MatchStatus.CLOSED },
  // Domingo, 5 de julho
  { homeTeam: 'A Definir', awayTeam: 'A Definir', matchDate: '2026-07-05T20:00:00.000Z', description: 'Jogo 91 – Oitavas de Final', stadium: 'Nova York',     status: MatchStatus.CLOSED },
  { homeTeam: 'A Definir', awayTeam: 'A Definir', matchDate: '2026-07-06T00:00:00.000Z', description: 'Jogo 92 – Oitavas de Final', stadium: 'Cidade do México', status: MatchStatus.CLOSED },
  // Segunda-feira, 6 de julho
  { homeTeam: 'A Definir', awayTeam: 'A Definir', matchDate: '2026-07-06T19:00:00.000Z', description: 'Jogo 93 – Oitavas de Final', stadium: 'Dallas',        status: MatchStatus.CLOSED },
  { homeTeam: 'A Definir', awayTeam: 'A Definir', matchDate: '2026-07-07T00:00:00.000Z', description: 'Jogo 94 – Oitavas de Final', stadium: 'Seattle',       status: MatchStatus.CLOSED },
  // Terça-feira, 7 de julho
  { homeTeam: 'A Definir', awayTeam: 'A Definir', matchDate: '2026-07-07T16:00:00.000Z', description: 'Jogo 95 – Oitavas de Final', stadium: 'Atlanta',       status: MatchStatus.CLOSED },
  { homeTeam: 'A Definir', awayTeam: 'A Definir', matchDate: '2026-07-07T20:00:00.000Z', description: 'Jogo 96 – Oitavas de Final', stadium: 'Vancouver',     status: MatchStatus.CLOSED },

  // ─── QUARTAS DE FINAL ────────────────────────────────────────────────
  // Quinta-feira, 9 de julho
  { homeTeam: 'França',    awayTeam: 'Marrocos',   matchDate: '2026-07-09T20:00:00.000Z', description: 'Jogo 97 – Quartas de Final',  stadium: 'Boston',        status: MatchStatus.OPEN },
  // Sexta-feira, 10 de julho
  { homeTeam: 'Espanha',   awayTeam: 'Bélgica',    matchDate: '2026-07-10T19:00:00.000Z', description: 'Jogo 98 – Quartas de Final',  stadium: 'Los Angeles',   status: MatchStatus.OPEN },
  // Sábado, 11 de julho
  { homeTeam: 'Noruega',   awayTeam: 'Inglaterra', matchDate: '2026-07-11T21:00:00.000Z', description: 'Jogo 99 – Quartas de Final',  stadium: 'Miami',         status: MatchStatus.OPEN },
  { homeTeam: 'Argentina', awayTeam: 'Suíça',      matchDate: '2026-07-12T01:00:00.000Z', description: 'Jogo 100 – Quartas de Final', stadium: 'Kansas City',   status: MatchStatus.OPEN },

  // ─── SEMIFINAIS ──────────────────────────────────────────────────────
  // Terça-feira, 14 de julho
  { homeTeam: 'A Definir', awayTeam: 'A Definir', matchDate: '2026-07-14T19:00:00.000Z', description: 'Jogo 101 – Semifinal',        stadium: 'Dallas',        status: MatchStatus.CLOSED },
  // Quarta-feira, 15 de julho
  { homeTeam: 'A Definir', awayTeam: 'A Definir', matchDate: '2026-07-15T19:00:00.000Z', description: 'Jogo 102 – Semifinal',        stadium: 'Atlanta',       status: MatchStatus.CLOSED },

  // ─── DISPUTA DE 3º LUGAR ─────────────────────────────────────────────
  // Sábado, 18 de julho
  { homeTeam: 'A Definir', awayTeam: 'A Definir', matchDate: '2026-07-18T21:00:00.000Z', description: 'Jogo 103 – Disputa de 3º Lugar', stadium: 'Miami',     status: MatchStatus.CLOSED },

  // ─── FINAL ───────────────────────────────────────────────────────────
  // Domingo, 19 de julho
  { homeTeam: 'A Definir', awayTeam: 'A Definir', matchDate: '2026-07-19T19:00:00.000Z', description: 'Jogo 104 – Final',            stadium: 'Nova York',     status: MatchStatus.CLOSED },
];

const MATCHES_TO_SEED = COPA_2026_MATCHES.filter(
  (match) => match.homeTeam !== 'A Definir' && match.awayTeam !== 'A Definir',
);

@Injectable()
export class MatchSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(MatchSeedService.name);

  constructor(
    @InjectModel(Match.name) private readonly matchModel: Model<MatchDocument>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      const count = await this.matchModel.countDocuments();
      if (count > 0) return;

      await this.matchModel.insertMany(
        MATCHES_TO_SEED.map((m) => ({
          homeTeam: m.homeTeam,
          awayTeam: m.awayTeam,
          matchDate: new Date(m.matchDate),
          description: m.description,
          stadium: m.stadium,
          status: m.status ?? MatchStatus.OPEN,
          homeScore: null,
          awayScore: null,
        })),
      );

      this.logger.log(`Copa 2026: ${MATCHES_TO_SEED.length} partidas cadastradas com sucesso.`);
    } catch (err) {
      this.logger.error('Falha ao seed das partidas da Copa 2026', err);
    }
  }
}
