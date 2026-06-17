import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  ServiceUnavailableException,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { UnsubscribeDto } from './dto/unsubscribe.dto';
import { BroadcastDto } from './dto/broadcast.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorators';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { RequestUser } from '../auth/interfaces/request-user.interface';
import { UnauthorizedException, Headers } from '@nestjs/common';
import moment from 'moment-timezone';
import { ConfigService } from '@nestjs/config';
import { MatchesService } from '../matches/matches.service';
import * as webpush from 'web-push';

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {

  private readonly logger = new Logger(NotificationsController.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
    private readonly matchesService: MatchesService,
  ) {}

  // GET /api/notifications/vapid-public-key — chave pública para o cliente inscrever-se
  @Get('vapid-public-key')
  getVapidPublicKey() {
    return { publicKey: this.notificationsService.getPublicKey() };
  }

  // POST /api/notifications/subscribe — registra a inscrição do usuário logado
  @Post('subscribe')
  @HttpCode(HttpStatus.CREATED)
  subscribe(@CurrentUser() user: RequestUser, @Body() dto: SubscribeDto) {
    return this.notificationsService.saveSubscription(user.userId, dto);
  }

  // DELETE /api/notifications/subscribe — remove uma inscrição
  @Delete('subscribe')
  @HttpCode(HttpStatus.OK)
  unsubscribe(@Body() dto: UnsubscribeDto) {
    return this.notificationsService.removeSubscription(dto.endpoint);
  }

  // -------------------------------------------------
  //  Cron – executado a cada hora (0 * * * *)
  // -------------------------------------------------
  @Get('cron/send-match-notifications')
  async sendMatchNotifications(@Headers('authorization') authHeader: string) {
    this.logger.log('Cron job started: sendMatchNotifications');
    // 1️⃣ proteção
    const cronSecret = this.configService.get<string>('CRON_SECRET');
    if (!cronSecret || !authHeader || authHeader.replace('Bearer ', '') !== cronSecret) {
      throw new UnauthorizedException('Invalid cron secret');
    }

    // 2️⃣ janela de busca (20‑80 min a partir de agora)
    const now = new Date();
    const start = new Date(now.getTime() + 20 * 60_000);
    const end = new Date(now.getTime() + 80 * 60_000);

    // 3️⃣ buscar partidas próximas
    const matches = await this.matchesService.findBetweenDates(start, end);

    if (!matches?.length) {
      this.logger.log('Nenhuma partida na janela de notificação.');
      return { sent: 0 };
    }

    // 4️⃣ buscar subscrições ainda não notificadas
    const subscriptions = await this.notificationsService.findAllPending();

    let sent = 0;
    for (const match of matches) {
      const title = '⚽ Jogo começando em breve';
      const body = `${match.homeTeam} x ${match.awayTeam} começa em 20 minutos`;
      const localDate = moment(match.matchDate)
        .tz('America/Sao_Paulo')
        .format('DD/MM HH:mm');
      const payload = JSON.stringify({ title, body, matchDate: localDate });

      for (const sub of subscriptions) {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
            },
            payload,
          );
          await this.notificationsService.markSent(sub._id);
          sent++;
        } catch (e: any) {
          this.logger.error(`Falha ao enviar push para ${sub.endpoint}: ${e.message}`);
        }
      }
    }
    this.logger.log(`Notificações enviadas: ${sent}`);
    return { sent };
  }

  // POST /api/notifications/broadcast — apenas ADMIN envia notificação a todos
  @Post('broadcast')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async broadcast(@Body() dto: BroadcastDto) {
    if (!this.notificationsService.isConfigured()) {
      throw new ServiceUnavailableException(
        'Notificações push não configuradas no servidor.',
      );
    }
    return this.notificationsService.broadcast(dto.title, dto.body);
  }
}
