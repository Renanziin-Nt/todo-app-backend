import { PartialType } from '@nestjs/mapped-types';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email deve ter formato válido' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(6, { message: 'Senha deve ter pelo menos 6 caracteres' })
  password?: string;
}