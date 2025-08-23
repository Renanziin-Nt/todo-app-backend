import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString({ message: 'Nome deve ser uma string' })
  name: string;

  @IsNotEmpty({ message: 'Email é obrigatório' })
  @IsEmail({}, { message: 'Email deve ter formato válido' })
  email: string;

  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(6, { message: 'Senha deve ter pelo menos 6 caracteres' })
  password: string;
}