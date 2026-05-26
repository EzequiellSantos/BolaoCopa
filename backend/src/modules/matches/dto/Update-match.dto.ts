import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { MatchStatus } from '../schemas/match.schema';

export class UpdateMatchDto {
  @IsOptional()
  @IsEnum(MatchStatus, { message: 'Status inválido. Use OPEN, CLOSED ou FINISHED' })
  status?: MatchStatus;

  // Placar só é obrigatório quando o status for FINISHED
  @ValidateIf((o) => o.status === MatchStatus.FINISHED)
  @IsInt({ message: 'Placar do time da casa deve ser um número inteiro' })
  @Min(0, { message: 'Placar não pode ser negativo' })
  homeScore?: number;

  @ValidateIf((o) => o.status === MatchStatus.FINISHED)
  @IsInt({ message: 'Placar do time visitante deve ser um número inteiro' })
  @Min(0, { message: 'Placar não pode ser negativo' })
  awayScore?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  stadium?: string;
}