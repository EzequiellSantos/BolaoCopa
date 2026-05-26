import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BetsService } from './bets.service';
import { CreateBetDto } from './dto/create-bet.dto';
import { UpdateBetDto } from './dto/update-bet.dto';
import { JwtAuthGuard } from '../../common/guards/Jwt-auth.guard';
import { RolesGuard } from '../../common/guards/Roles.guard';
import { Roles } from '../../common/decorators/Roles.decorators';
import { CurrentUser } from '../../common/decorators/Current-user.decorator';
import { RequestUser } from '../auth/interfaces/Request-user.interface';
import { UserRole } from '../users/schemas/User.schema';

@Controller('bets')
@UseGuards(JwtAuthGuard)
export class BetsController {
  constructor(private readonly betsService: BetsService) {}

  // POST /api/bets — usuário autenticado cria aposta
  @Post()
  create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateBetDto,
  ) {
    return this.betsService.create(user.userId, dto);
  }

  // GET /api/bets/my — lista apostas do próprio usuário
  @Get('my')
  findMyBets(@CurrentUser() user: RequestUser) {
    return this.betsService.findMyBets(user.userId);
  }

  // GET /api/bets/:id — usuário busca aposta própria pelo ID
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.betsService.findById(id, user.userId);
  }

  // PATCH /api/bets/:id — usuário edita aposta própria (só se OPEN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateBetDto,
  ) {
    return this.betsService.update(user.userId, id, dto);
  }

  // GET /api/bets/admin/all — ADMIN lista todas as apostas
  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.betsService.findAll();
  }

  // GET /api/bets/admin/match/:matchId — ADMIN vê apostas de uma partida
  @Get('admin/match/:matchId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findByMatch(@Param('matchId') matchId: string) {
    return this.betsService.findByMatch(matchId);
  }
}