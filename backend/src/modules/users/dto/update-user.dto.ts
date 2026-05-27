import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '../schemas/user.schema';

// Campos permitidos para atualização do próprio usuário
class UpdateUserBase extends PartialType(
  OmitType(CreateUserDto, ['password', 'role'] as const),
) {}

export class UpdateUserDto extends UpdateUserBase {
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  @MaxLength(64, { message: 'Senha deve ter no máximo 64 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Senha deve conter ao menos 1 letra maiúscula, 1 minúscula e 1 número',
  })
  password?: string;
}

export class AdminUpdateUserDto extends UpdateUserDto {
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role inválida. Use ADMIN ou USER' })
  role?: UserRole;

  @IsOptional()
  @IsBoolean({ message: 'isActive deve ser verdadeiro ou falso' })
  isActive?: boolean;
}
