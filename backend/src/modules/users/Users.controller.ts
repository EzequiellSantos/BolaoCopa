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
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorators';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from './schemas/user.schema';
import { RequestUser } from '../auth/interfaces/request-user.interface';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // POST /api/users — apenas ADMIN cria usuários
  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  // GET /api/users — apenas ADMIN lista todos
  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  // GET /api/users/me — usuário autenticado vê o próprio perfil
  @Get('me')
  getProfile(@CurrentUser() user: RequestUser) {
    return this.usersService.findById(user.userId);
  }

  // GET /api/users/:id — apenas ADMIN busca por ID
  @Get(':id')
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  // PATCH /api/users/:id — ADMIN atualiza qualquer usuário
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  // PATCH /api/users/me — usuário atualiza o próprio perfil (sem trocar role)
  @Patch('me/profile')
  updateProfile(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateUserDto,
  ) {
    // Remove role do DTO para o usuário não conseguir se autopromover
    const { role: _role, ...safeDto } = dto as any;
    return this.usersService.update(user.userId, safeDto);
  }

  // DELETE /api/users/:id — apenas ADMIN desativa usuário (soft delete)
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}