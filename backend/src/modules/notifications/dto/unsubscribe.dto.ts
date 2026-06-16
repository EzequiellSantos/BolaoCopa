import { IsNotEmpty, IsString } from 'class-validator';

export class UnsubscribeDto {
  @IsString()
  @IsNotEmpty({ message: 'endpoint é obrigatório' })
  endpoint: string;
}
