import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { MatchStatus } from '../schemas/match.schema';

export class CreateMatchDto {
  @IsString()
  @IsNotEmpty({ message: 'Time da casa é obrigatório' })
  @MaxLength(100, { message: 'Nome do time deve ter no máximo 100 caracteres' })
  homeTeam: string;

  @IsString()
  @IsNotEmpty({ message: 'Time visitante é obrigatório' })
  @MaxLength(100, { message: 'Nome do time deve ter no máximo 100 caracteres' })
  awayTeam: string;

  @IsDateString({}, { message: 'Data da partida inválida. Use formato ISO 8601' })
  @IsNotEmpty({ message: 'Data da partida é obrigatória' })
  matchDate: string;

  @IsOptional()
  @IsEnum(MatchStatus, { message: 'Status inválido. Use OPEN, CLOSED ou FINISHED' })
  status?: MatchStatus;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  stadium?: string;
}