import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Bet, BetSchema } from '../bets/schemas/bet.schema';
import { Match, MatchSchema } from '../matches/schemas/match.schema';
import { WinningsService } from './winnings.service';
import { WinningsController } from './winnings.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Bet.name, schema: BetSchema },
      { name: Match.name, schema: MatchSchema },
    ]),
  ],
  controllers: [WinningsController],
  providers: [WinningsService],
})
export class WinningsModule {}
