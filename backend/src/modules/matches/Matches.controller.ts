import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MatchesService } from './Matches.service';
import { CreateMatchDto } from './dto/Create-match.dto';
import { UpdateMatchDto } from './dto/Update-match.dto';
import { JwtAuthGuard } from '../../common/guards/Jwt-auth.guard';
import { RolesGuard } from '../../common/guards/Roles.guard';
import { Roles } from '../../common/decorators/Roles.decorators';
import { UserRole } from '../users/schemas/user.schema';
import { MatchStatus } from './schemas/match.schema';

@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  // POST /api/matches — apenas ADMIN cria partidas
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateMatchDto) {
    return this.matchesService.create(dto);
  }

  // GET /api/matches — todos autenticados listam partidas
  // ?status=OPEN | CLOSED | FINISHED (opcional)
  @Get()
  findAll(@Query('status') status?: MatchStatus) {
    return this.matchesService.findAll(status);
  }

  // GET /api/matches/open — atalho para partidas abertas (uso do front)
  @Get('open')
  findOpen() {
    return this.matchesService.findOpen();
  }

  // GET /api/matches/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.matchesService.findById(id);
  }

  // PATCH /api/matches/:id — apenas ADMIN atualiza (status, placar, etc.)
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateMatchDto) {
    return this.matchesService.update(id, dto);
  }

  // PATCH /api/matches/:id/status — atalho para mudar apenas o status
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: MatchStatus,
  ) {
    return this.matchesService.updateStatus(id, status);
  }

  // DELETE /api/matches/:id — apenas ADMIN remove (só partidas OPEN)
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.matchesService.remove(id);
  }
}