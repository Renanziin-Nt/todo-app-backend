import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTodoDto {
  @IsNotEmpty({ message: 'Título é obrigatório' })
  @IsString({ message: 'Título deve ser uma string' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  description?: string;
}