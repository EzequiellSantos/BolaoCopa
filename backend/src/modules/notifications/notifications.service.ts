import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as webpush from 'web-push';
import {
  PushSubscription,
  PushSubscriptionDocument,
} from './schemas/push-subscription.schema';
import { SubscribeDto } from './dto/subscribe.dto';

@Injectable()
export class NotificationsService implements OnModuleInit {
  constructor(
    @InjectModel(PushSubscription.name)
    private readonly subscriptionModel: Model<PushSubscriptionDocument>,
    private readonly configService: ConfigService,
  ) {}

  /** Busca subscrições pendentes */
  async findAllPending() {
    return this.subscriptionModel.find({ notificationSent: false }).exec();
  }

  /** Marca como enviada */
  async markSent(id: string) {
    return this.subscriptionModel.updateOne({ _id: id }, { $set: { notificationSent: true } }).exec();
  }

  private readonly logger = new Logger(NotificationsService.name);
  private vapidConfigured = false;
  private publicKey = '';


  onModuleInit() {
    const publicKey = this.configService.get<string>('VAPID_PUBLIC_KEY');
    const privateKey = this.configService.get<string>('VAPID_PRIVATE_KEY');
    const subject =
      this.configService.get<string>('VAPID_SUBJECT') || 'mailto:admin@bolao.com';

    if (publicKey && privateKey) {
      webpush.setVapidDetails(subject, publicKey, privateKey);
      this.publicKey = publicKey;
      this.vapidConfigured = true;
      this.logger.log('✅ Web Push (VAPID) configurado');
    } else {
      this.logger.warn(
        '⚠️  VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY ausentes — notificações push desativadas',
      );
    }
  }

  getPublicKey(): string {
    return this.publicKey;
  }

  isConfigured(): boolean {
    return this.vapidConfigured;
  }

  // Salva (ou atualiza) a inscrição do usuário, deduplicando por endpoint.
  async saveSubscription(userId: string, dto: SubscribeDto) {
    await this.subscriptionModel.updateOne(
      { endpoint: dto.endpoint },
      {
        $set: {
          user: new Types.ObjectId(userId),
          endpoint: dto.endpoint,
          keys: dto.keys,
        },
      },
      { upsert: true },
    );
    return { success: true };
  }

  async removeSubscription(endpoint: string) {
    await this.subscriptionModel.deleteOne({ endpoint });
    return { success: true };
  }

  // Envia uma notificação para todos os inscritos. Remove inscrições expiradas.
  async broadcast(title: string, body: string) {
    if (!this.vapidConfigured) {
      throw new Error(
        'Notificações push não configuradas no servidor (VAPID ausente).',
      );
    }

    const subscriptions = await this.subscriptionModel.find().lean();
    const payload = JSON.stringify({ title, body });

    let sent = 0;
    let failed = 0;
    const expiredEndpoints: string[] = [];

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
            },
            payload,
          );
          sent += 1;
        } catch (err: any) {
          failed += 1;
          // 404/410 → inscrição expirada/cancelada: limpar do banco
          if (err?.statusCode === 404 || err?.statusCode === 410) {
            expiredEndpoints.push(sub.endpoint);
          } else {
            this.logger.error(
              `Falha ao enviar push para ${sub.endpoint}: ${err?.message}`,
            );
          }
        }
      }),
    );

    if (expiredEndpoints.length > 0) {
      await this.subscriptionModel.deleteMany({
        endpoint: { $in: expiredEndpoints },
      });
    }

    return { sent, failed, total: subscriptions.length };
  }
}
