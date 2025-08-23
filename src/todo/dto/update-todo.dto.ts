import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CreateTodoDto } from './create-todo.dto';

export enum TodoStatus {
  PENDING = 'PENDING',
  STARTED = 'STARTED',
  DONE = 'DONE',
}

export class UpdateTodoDto extends PartialType(CreateTodoDto) {
  @IsOptional()
  @IsString({ message: 'Título deve ser uma string' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  description?: string;

  @IsOptional()
  @IsEnum(TodoStatus, { message: 'Status deve ser PENDING, STARTED ou DONE' })
  status?: TodoStatus;
}