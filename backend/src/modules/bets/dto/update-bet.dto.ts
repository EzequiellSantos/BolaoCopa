import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateBetDto {
  @IsOptional()
  @IsInt({ message: 'Placar do time da casa deve ser um número inteiro' })
  @Min(0, { message: 'Placar não pode ser negativo' })
  homeScore?: number;

  @IsOptional()
  @IsInt({ message: 'Placar do time visitante deve ser um número inteiro' })
  @Min(0, { message: 'Placar não pode ser negativo' })
  awayScore?: number;

  @IsOptional()
  @IsIn(['home', 'away'], { message: 'penaltyWinner deve ser "home" ou "away"' })
  penaltyWinner?: 'home' | 'away';
}