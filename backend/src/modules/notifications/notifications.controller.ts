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
import { Query, UnauthorizedException } from '@nestjs/common';
import { MatchesService } from '../matches/matches.service';

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

@Controller('notifications')
export class NotificationsController {

  private readonly logger = new Logger(NotificationsController.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly matchesService: MatchesService,
  ) {}

  // GET /api/notifications/vapid-public-key — chave pública para o cliente inscrever-se
  @Get('vapid-public-key')
  @UseGuards(JwtAuthGuard)
  getVapidPublicKey() {
    return { publicKey: this.notificationsService.getPublicKey() };
  }

  // POST /api/notifications/subscribe — registra a inscrição do usuário logado
  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  subscribe(@CurrentUser() user: RequestUser, @Body() dto: SubscribeDto) {
    return this.notificationsService.saveSubscription(user.userId, dto);
  }

  // DELETE /api/notifications/subscribe — remove uma inscrição
  @Delete('subscribe')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  unsubscribe(@Body() dto: UnsubscribeDto) {
    return this.notificationsService.removeSubscription(dto.endpoint);
  }

  // -------------------------------------------------
  //  Cron – executado a cada hora (0 * * * *)
  // -------------------------------------------------
  @Get('cron/send-match-notifications')
  async sendMatchNotifications(@Query('secret') secret: string) {
    const cronSecret = process.env.CRON_SECRET;
    if (!secret || !cronSecret || secret !== cronSecret) {
      this.logger.warn('Invalid cron secret via query parameter');
      throw new UnauthorizedException('Invalid cron secret');
    }

    const { closedCount, matches: autoClosedMatches } =
      await this.matchesService.closeStartedMatches();

    if (closedCount > 0) {
      this.logger.warn(
        `${closedCount} partida(s) fechada(s) automaticamente: ${autoClosedMatches
          .map(m => `${m.homeTeam} x ${m.awayTeam}`)
          .join(', ')}`,
      );
    }

    const now = new Date();
    const start = new Date(now.getTime() + 15 * 60_000);
    const end   = new Date(now.getTime() + 35 * 60_000);

    const matches = await this.matchesService.findBetweenDates(start, end);

    if (!matches?.length) {
      return { sent: 0, autoClosedCount: closedCount };
    }

    try {
      const sent = await this.notificationsService.sendMatchNotifications(matches);
      await this.notificationsService.resetNotificationFlags();
      return { sent, autoClosedCount: closedCount };

    } catch (error) {
      this.logger.error('[CRON] failed', error);
      throw error;
    }
  }


  // POST /api/notifications/broadcast — apenas ADMIN envia notificação a todos
  @Post('broadcast')
  @UseGuards(JwtAuthGuard, RolesGuard)
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
