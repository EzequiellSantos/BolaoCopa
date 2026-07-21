import { Controller, Get, UseGuards } from '@nestjs/common';
import { WinningsService } from './winnings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestUser } from '../auth/interfaces/request-user.interface';

@Controller('winnings')
@UseGuards(JwtAuthGuard)
export class WinningsController {
  constructor(private readonly winningsService: WinningsService) {}

  // GET /api/winnings/me — resumo e detalhamento partida a partida do usuário autenticado
  @Get('me')
  getMyWinnings(@CurrentUser() user: RequestUser) {
    return this.winningsService.getUserWinnings(user.userId);
  }
}
