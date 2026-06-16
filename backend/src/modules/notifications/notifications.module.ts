import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PushSubscription,
  PushSubscriptionSchema,
} from './schemas/push-subscription.schema';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { MatchesModule } from '../matches/matches.module';

@Module({
  imports: [
    MatchesModule,
    MongooseModule.forFeature([
      {
        name: PushSubscription.name,
        schema: PushSubscriptionSchema
      },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
