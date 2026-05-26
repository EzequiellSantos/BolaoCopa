import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { UsersService } from './Users.service';

@Injectable()
export class AdminSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(private readonly usersService: UsersService) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.usersService.ensureAdminExists();
    } catch (err) {
      this.logger.error('Falha ao criar admin inicial', err);
    }
  }
}
