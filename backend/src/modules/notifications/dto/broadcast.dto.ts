import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class BroadcastDto {
  @IsString()
  @IsNotEmpty({ message: 'Título é obrigatório' })
  @MaxLength(100, { message: 'Título deve ter no máximo 100 caracteres' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Mensagem é obrigatória' })
  @MaxLength(500, { message: 'Mensagem deve ter no máximo 500 caracteres' })
  body: string;
}
