import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Match, MatchSchema } from './schemas/Match.schema';
import { Bet, BetSchema } from '../bets/schemas/Bet.schema';
import { MatchesService } from './Matches.service';
import { MatchesController } from './Matches.controller';

@Module({
  imports: [  
    MongooseModule.forFeature([
      { name: Match.name, schema: MatchSchema },
      // BetSchema necessário para settleBets() calcular pontuações
      { name: Bet.name, schema: BetSchema },
    ]),
  ],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}