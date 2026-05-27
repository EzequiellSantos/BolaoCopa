import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Match, MatchSchema } from './schemas/match.schema';
import { Bet, BetSchema } from '../bets/schemas/bet.schema';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { MatchSeedService } from './match-seed.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Match.name, schema: MatchSchema },
      // BetSchema necessário para settleBets() calcular pontuações
      { name: Bet.name, schema: BetSchema },
    ]),
  ],
  controllers: [MatchesController],
  providers: [MatchesService, MatchSeedService],
  exports: [MatchesService],
})
export class MatchesModule {}
