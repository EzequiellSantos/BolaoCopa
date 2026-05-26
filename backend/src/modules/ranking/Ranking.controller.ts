import { Controller, Get, UseGuards } from '@nestjs/common';
import { RankingService } from './ranking.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestUser } from '../auth/interfaces/request-user.interface';

@Controller('ranking')
@UseGuards(JwtAuthGuard)
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  // GET /api/ranking — ranking completo de todos os usuários
  @Get()
  getRanking() {
    return this.rankingService.getRanking();
  }

  // GET /api/ranking/me — posição e pontuação do usuário autenticado
  @Get('me')
  getMyRanking(@CurrentUser() user: RequestUser) {
    return this.rankingService.getUserRanking(user.userId);
  }
}