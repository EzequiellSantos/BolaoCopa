import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Match, MatchDocument, MatchStatus } from './schemas/match.schema';

interface MatchSeed {
  homeTeam: string;
  awayTeam: string;
  matchDate: Date;
  description: string;
  stadium: string;
  status: MatchStatus;
}

@Injectable()
export class MatchSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(MatchSeedService.name);

  constructor(
    @InjectModel(Match.name) private readonly matchModel: Model<MatchDocument>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      const count = await this.matchModel.countDocuments();
      if (count > 0) {
        this.logger.log(`Seed ignorado: ${count} partidas já existem no banco.`);
        return;
      }
      await this.seedMatches();
    } catch (err) {
      this.logger.error('Falha ao semear partidas da Copa 2026', err);
    }
  }

  private async seedMatches(): Promise<void> {
    const matches = this.buildMatches();
    await this.matchModel.insertMany(matches);
    this.logger.log(`✅ ${matches.length} partidas da Copa 2026 inseridas com sucesso.`);
  }

  // ─── Constrói todas as 72 partidas da fase de grupos ─────────────────
  private buildMatches(): MatchSeed[] {
    const groups: Record<string, [string, string, string, string]> = {
      A: ['USA', 'Panama', 'Honduras', 'Marrocos'],
      B: ['México', 'Jamaica', 'Senegal', 'Equador'],
      C: ['Canadá', 'Colômbia', 'Peru', 'Japão'],
      D: ['Argentina', 'Venezuela', 'Austrália', 'Chile'],
      E: ['Espanha', 'Países Baixos', 'Nigéria', 'Costa Rica'],
      F: ['França', 'Inglaterra', 'Camarões', 'Arábia Saudita'],
      G: ['Brasil', 'Portugal', 'Irã', 'Coreia do Sul'],
      H: ['Alemanha', 'Itália', 'Uruguai', 'Egito'],
      I: ['Bélgica', 'Croácia', 'Costa do Marfim', 'Paraguai'],
      J: ['Polônia', 'Dinamarca', 'Turquia', 'Nova Zelândia'],
      K: ['Sérvia', 'Ucrânia', 'Argélia', 'Bolívia'],
      L: ['Áustria', 'Suíça', 'África do Sul', 'Bahrain'],
    };

    // Estádios por grupo (host country rotation)
    const stadiums: Record<string, string[]> = {
      A: ['MetLife Stadium', 'Rose Bowl', 'Hard Rock Stadium'],
      B: ['Estadio Azteca', 'Estadio Akron', 'Estadio BBVA'],
      C: ['BC Place', 'BMO Field', 'Stade Olympique'],
      D: ['AT&T Stadium', 'Arrowhead Stadium', 'MetLife Stadium'],
      E: ['SoFi Stadium', 'Levi\'s Stadium', 'Rose Bowl'],
      F: ['Mercedes-Benz Stadium', 'Lincoln Financial Field', 'Gillette Stadium'],
      G: ['Estadio BBVA', 'Estadio Azteca', 'Estadio Akron'],
      H: ['Lumen Field', 'Hard Rock Stadium', 'AT&T Stadium'],
      I: ['BMO Field', 'BC Place', 'Stade Olympique'],
      J: ['SoFi Stadium', 'Arrowhead Stadium', 'Levi\'s Stadium'],
      K: ['Lincoln Financial Field', 'Mercedes-Benz Stadium', 'MetLife Stadium'],
      L: ['Gillette Stadium', 'Rose Bowl', 'AT&T Stadium'],
    };

    // Datas de cada rodada por grupo
    // Rodada 1: 11-16 Jun | Rodada 2: 17-22 Jun | Rodada 3: 26 Jun - 2 Jul
    const groupDates: Record<string, [Date, Date, Date, Date, Date, Date]> = {
      // [R1-Jogo1, R1-Jogo2, R2-Jogo1, R2-Jogo2, R3-Jogo1, R3-Jogo2]
      A: this.dates('2026-06-11', '2026-06-12', '2026-06-17', '2026-06-17', '2026-06-26', '2026-06-26'),
      B: this.dates('2026-06-11', '2026-06-12', '2026-06-18', '2026-06-18', '2026-06-26', '2026-06-27'),
      C: this.dates('2026-06-12', '2026-06-13', '2026-06-18', '2026-06-19', '2026-06-27', '2026-06-27'),
      D: this.dates('2026-06-12', '2026-06-13', '2026-06-19', '2026-06-19', '2026-06-27', '2026-06-28'),
      E: this.dates('2026-06-13', '2026-06-14', '2026-06-19', '2026-06-20', '2026-06-28', '2026-06-28'),
      F: this.dates('2026-06-13', '2026-06-14', '2026-06-20', '2026-06-20', '2026-06-28', '2026-06-29'),
      G: this.dates('2026-06-14', '2026-06-15', '2026-06-20', '2026-06-21', '2026-06-29', '2026-06-29'),
      H: this.dates('2026-06-14', '2026-06-15', '2026-06-21', '2026-06-21', '2026-06-29', '2026-06-30'),
      I: this.dates('2026-06-15', '2026-06-15', '2026-06-21', '2026-06-22', '2026-06-30', '2026-06-30'),
      J: this.dates('2026-06-15', '2026-06-16', '2026-06-22', '2026-06-22', '2026-06-30', '2026-07-01'),
      K: this.dates('2026-06-16', '2026-06-16', '2026-06-22', '2026-06-22', '2026-07-01', '2026-07-01'),
      L: this.dates('2026-06-16', '2026-06-16', '2026-06-22', '2026-06-22', '2026-07-01', '2026-07-02'),
    };

    const all: MatchSeed[] = [];

    for (const [group, teams] of Object.entries(groups)) {
      const [t1, t2, t3, t4] = teams;
      const stads = stadiums[group];
      const [d1, d2, d3, d4, d5, d6] = groupDates[group];

      // Rodada 1
      all.push(this.match(t1, t2, d1, `Grupo ${group} - Rodada 1`, stads[0]));
      all.push(this.match(t3, t4, d2, `Grupo ${group} - Rodada 1`, stads[0]));
      // Rodada 2
      all.push(this.match(t1, t3, d3, `Grupo ${group} - Rodada 2`, stads[1]));
      all.push(this.match(t2, t4, d4, `Grupo ${group} - Rodada 2`, stads[1]));
      // Rodada 3
      all.push(this.match(t1, t4, d5, `Grupo ${group} - Rodada 3`, stads[2]));
      all.push(this.match(t2, t3, d6, `Grupo ${group} - Rodada 3`, stads[2]));
    }

    return all;
  }

  private match(
    homeTeam: string,
    awayTeam: string,
    matchDate: Date,
    description: string,
    stadium: string,
  ): MatchSeed {
    return { homeTeam, awayTeam, matchDate, description, stadium, status: MatchStatus.OPEN };
  }

  private dates(
    d1: string, d2: string, d3: string, d4: string, d5: string, d6: string,
  ): [Date, Date, Date, Date, Date, Date] {
    return [
      new Date(d1),
      new Date(d2),
      new Date(d3),
      new Date(d4),
      new Date(d5),
      new Date(d6),
    ];
  }
}
