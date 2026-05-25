import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import { validateEnv } from './config/env.validation';

@Module({
  imports: [
    // ─── Config (global, available in all modules) ─────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
      validate: validateEnv,
      envFilePath: '.env',
    }),

    // ─── Database ──────────────────────────────────────────────────────
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
        connectionFactory: (connection) => {
          connection.on('connected', () => {
            console.log('✅ MongoDB connected successfully');
          });
          connection.on('error', (err: Error) => {
            console.error('❌ MongoDB connection error:', err.message);
          });
          return connection;
        },
      }),
      inject: [ConfigService],
    }),

    // ─── Feature Modules (adicionados nas próximas etapas) ─────────────
    // AuthModule,
    // UsersModule,
    // MatchesModule,
    // BetsModule,
    // RankingModule,
  ],
})
export class AppModule {}