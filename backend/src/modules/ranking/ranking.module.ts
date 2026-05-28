import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Bet, BetSchema } from '../bets/schemas/bet.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { RankingService } from './ranking.service';
import { RankingController } from './ranking.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Bet.name, schema: BetSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [RankingController],
  providers: [RankingService],
})
export class RankingModule {}
