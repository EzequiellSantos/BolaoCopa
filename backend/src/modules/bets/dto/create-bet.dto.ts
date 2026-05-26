import { IsInt, IsMongoId, IsNotEmpty, Min } from 'class-validator';

export class CreateBetDto {
  @IsMongoId({ message: 'ID da partida inválido' })
  @IsNotEmpty({ message: 'ID da partida é obrigatório' })
  matchId: string;

  @IsInt({ message: 'Placar do time da casa deve ser um número inteiro' })
  @Min(0, { message: 'Placar não pode ser negativo' })
  homeScore: number;

  @IsInt({ message: 'Placar do time visitante deve ser um número inteiro' })
  @Min(0, { message: 'Placar não pode ser negativo' })
  awayScore: number;
}