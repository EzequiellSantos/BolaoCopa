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

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

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
