import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

// Herda todas as validações de CreateUserDto, mas todos os campos viram opcionais
// OmitType remove o password original para redefinirmos com validação própria
class UpdateUserBase extends PartialType(OmitType(CreateUserDto, ['password'] as const)) {}

export class UpdateUserDto extends UpdateUserBase {
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  @MaxLength(64, { message: 'Senha deve ter no máximo 64 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Senha deve conter ao menos 1 letra maiúscula, 1 minúscula e 1 número',
  })
  password?: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive deve ser verdadeiro ou falso' })
  isActive?: boolean;
}