import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Bet, BetSchema } from './schemas/bet.schema';
import { Match, MatchSchema } from '../matches/schemas/match.schema';
import { BetsService } from './bets.service';
import { BetsController } from './bets.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Bet.name, schema: BetSchema },
      // Match necessário para validar status antes de aceitar apostas
      { name: Match.name, schema: MatchSchema },
    ]),
  ],
  controllers: [BetsController],
  providers: [BetsService],
  exports: [BetsService],
})
export class BetsModule {}