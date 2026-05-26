import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Bet, BetSchema } from '../bets/schemas/bet.schema';
import { RankingService } from './Ranking.service';
import { RankingController } from './Ranking.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Bet.name, schema: BetSchema }]),
  ],
  controllers: [RankingController],
  providers: [RankingService],
})
export class RankingModule {}
