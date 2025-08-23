import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodoService {
  constructor(private prisma: PrismaService) {}

  async create(createTodoDto: CreateTodoDto, userId: string) {
    const todo = await this.prisma.todo.create({
      data: {
        title: createTodoDto.title,
        description: createTodoDto.description,
        userId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return todo;
  }

  async findAll(userId: string, status?: string) {
    const where: any = { userId };
    
    if (status && ['PENDING', 'STARTED', 'DONE'].includes(status)) {
      where.status = status;
    }

    const todos = await this.prisma.todo.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return todos;
  }

  async findOne(id: string, userId: string) {
    const todo = await this.prisma.todo.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!todo) {
      throw new NotFoundException('Todo não encontrado');
    }


    if (todo.userId !== userId) {
      throw new ForbiddenException('Você não tem permissão para acessar este todo');
    }

    return todo;
  }

  async update(id: string, updateTodoDto: UpdateTodoDto, userId: string) {

    const existingTodo = await this.prisma.todo.findUnique({
      where: { id },
    });

    if (!existingTodo) {
      throw new NotFoundException('Todo não encontrado');
    }

    if (existingTodo.userId !== userId) {
      throw new ForbiddenException('Você não tem permissão para atualizar este todo');
    }

    const todo = await this.prisma.todo.update({
      where: { id },
      data: {
        ...(updateTodoDto.title && { title: updateTodoDto.title }),
        ...(updateTodoDto.description !== undefined && { description: updateTodoDto.description }),
        ...(updateTodoDto.status && { status: updateTodoDto.status }),
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return todo;
  }

  async remove(id: string, userId: string) {

    const existingTodo = await this.prisma.todo.findUnique({
      where: { id },
    });

    if (!existingTodo) {
      throw new NotFoundException('Todo não encontrado');
    }

    if (existingTodo.userId !== userId) {
      throw new ForbiddenException('Você não tem permissão para deletar este todo');
    }

    await this.prisma.todo.delete({
      where: { id },
    });

    return { message: 'Todo removido com sucesso' };
  }

  async getStatistics(userId: string) {
    const [total, pending, started, done] = await Promise.all([
      this.prisma.todo.count({ where: { userId } }),
      this.prisma.todo.count({ where: { userId, status: 'PENDING' } }),
      this.prisma.todo.count({ where: { userId, status: 'STARTED' } }),
      this.prisma.todo.count({ where: { userId, status: 'DONE' } }),
    ]);

    return {
      total,
      pending,
      started,
      done,
      completion_rate: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  }
}