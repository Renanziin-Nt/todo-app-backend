import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { TodoService } from './todo.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

// Mock data
const mockUser = {
  id: 'user1',
  name: 'John Doe',
  email: 'john@example.com',
};

const mockTodo = {
  id: 'todo1',
  title: 'Test Todo',
  description: 'Test Description',
  status: 'PENDING' as const,
  userId: 'user1',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockTodoWithUser = {
  ...mockTodo,
  user: {
    id: mockUser.id,
    name: mockUser.name,
    email: mockUser.email,
  },
};

const mockTodoResponse = {
  id: 'todo1',
  title: 'Test Todo',
  description: 'Test Description',
  status: 'PENDING' as const,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  user: {
    id: mockUser.id,
    name: mockUser.name,
    email: mockUser.email,
  },
};

const mockCreateTodoDto: CreateTodoDto = {
  title: 'Test Todo',
  description: 'Test Description',
};

const mockUpdateTodoDto: UpdateTodoDto = {
  title: 'Updated Todo',
  status: 'STARTED' as any,
};

// Mock do PrismaService
const mockPrismaService = {
  todo: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

describe('TodoService', () => {
  let service: TodoService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TodoService>(TodoService);
    prismaService = module.get<PrismaService>(PrismaService);


    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new todo successfully', async () => {

      mockPrismaService.todo.create.mockResolvedValue(mockTodoResponse);


      const result = await service.create(mockCreateTodoDto, mockUser.id);


      expect(mockPrismaService.todo.create).toHaveBeenCalledWith({
        data: {
          title: mockCreateTodoDto.title,
          description: mockCreateTodoDto.description,
          userId: mockUser.id,
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
      expect(result).toEqual(mockTodoResponse);
    });

    it('should create a todo without description', async () => {

      const createTodoWithoutDesc = { title: 'Test Todo' };
      const mockResponseWithoutDesc = {
        ...mockTodoResponse,
        description: null,
      };
      mockPrismaService.todo.create.mockResolvedValue(mockResponseWithoutDesc);


      const result = await service.create(createTodoWithoutDesc, mockUser.id);


      expect(mockPrismaService.todo.create).toHaveBeenCalledWith({
        data: {
          title: createTodoWithoutDesc.title,
          description: undefined,
          userId: mockUser.id,
        },
        select: expect.any(Object),
      });
      expect(result).toEqual(mockResponseWithoutDesc);
    });
  });

  describe('findAll', () => {
    it('should return all todos for a user', async () => {

      const mockTodos = [
        {
          id: 'todo1',
          title: 'Todo 1',
          description: 'Desc 1',
          status: 'PENDING' as const,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 'todo2',
          title: 'Todo 2',
          description: 'Desc 2',
          status: 'DONE' as const,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
      ];
      mockPrismaService.todo.findMany.mockResolvedValue(mockTodos);


      const result = await service.findAll(mockUser.id);


      expect(mockPrismaService.todo.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
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
      expect(result).toEqual(mockTodos);
    });

    it('should filter todos by status', async () => {

      const filteredTodos = [
        {
          id: 'todo1',
          title: 'Pending Todo',
          description: 'Desc',
          status: 'PENDING' as const,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];
      mockPrismaService.todo.findMany.mockResolvedValue(filteredTodos);


      const result = await service.findAll(mockUser.id, 'PENDING');


      expect(mockPrismaService.todo.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id, status: 'PENDING' },
        select: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(filteredTodos);
    });

    it('should ignore invalid status filter', async () => {

      mockPrismaService.todo.findMany.mockResolvedValue([]);


      await service.findAll(mockUser.id, 'INVALID_STATUS');


      expect(mockPrismaService.todo.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        select: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a todo when found and user owns it', async () => {

      mockPrismaService.todo.findUnique.mockResolvedValue(mockTodoWithUser);

      const result = await service.findOne(mockTodo.id, mockUser.id);

      expect(mockPrismaService.todo.findUnique).toHaveBeenCalledWith({
        where: { id: mockTodo.id },
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
      expect(result).toEqual(mockTodoWithUser);
    });

    it('should throw NotFoundException when todo is not found', async () => {

      mockPrismaService.todo.findUnique.mockResolvedValue(null);


      await expect(service.findOne('nonexistent-id', mockUser.id)).rejects.toThrow(
        new NotFoundException('Todo não encontrado'),
      );
    });

    it('should throw ForbiddenException when user does not own the todo', async () => {

      const todoWithDifferentUser = {
        ...mockTodoWithUser,
        userId: 'different-user',
      };
      mockPrismaService.todo.findUnique.mockResolvedValue(todoWithDifferentUser);


      await expect(service.findOne(mockTodo.id, mockUser.id)).rejects.toThrow(
        new ForbiddenException('Você não tem permissão para acessar este todo'),
      );
    });
  });

  describe('update', () => {
    it('should update a todo successfully', async () => {

      mockPrismaService.todo.findUnique.mockResolvedValue(mockTodo);
      const updatedTodo = { ...mockTodoResponse, title: 'Updated Todo', status: 'STARTED' };
      mockPrismaService.todo.update.mockResolvedValue(updatedTodo);


      const result = await service.update(mockTodo.id, mockUpdateTodoDto, mockUser.id);


      expect(mockPrismaService.todo.findUnique).toHaveBeenCalledWith({
        where: { id: mockTodo.id },
      });
      expect(mockPrismaService.todo.update).toHaveBeenCalledWith({
        where: { id: mockTodo.id },
        data: {
          title: mockUpdateTodoDto.title,
          status: mockUpdateTodoDto.status,
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
      expect(result).toEqual(updatedTodo);
    });

    it('should throw NotFoundException when todo does not exist', async () => {

      mockPrismaService.todo.findUnique.mockResolvedValue(null);


      await expect(
        service.update('nonexistent-id', mockUpdateTodoDto, mockUser.id),
      ).rejects.toThrow(new NotFoundException('Todo não encontrado'));
    });

    it('should throw ForbiddenException when user does not own the todo', async () => {
 
      const todoWithDifferentUser = { ...mockTodo, userId: 'different-user' };
      mockPrismaService.todo.findUnique.mockResolvedValue(todoWithDifferentUser);


      await expect(
        service.update(mockTodo.id, mockUpdateTodoDto, mockUser.id),
      ).rejects.toThrow(
        new ForbiddenException('Você não tem permissão para atualizar este todo'),
      );
    });

    it('should update description to null when explicitly set', async () => {

      mockPrismaService.todo.findUnique.mockResolvedValue(mockTodo);
      const updateDtoWithNullDesc = { description: null };
      mockPrismaService.todo.update.mockResolvedValue(mockTodoResponse);


      await service.update(mockTodo.id, updateDtoWithNullDesc as any, mockUser.id);


      expect(mockPrismaService.todo.update).toHaveBeenCalledWith({
        where: { id: mockTodo.id },
        data: {
          description: null,
        },
        select: expect.any(Object),
      });
    });
  });

  describe('remove', () => {
    it('should remove a todo successfully', async () => {

      mockPrismaService.todo.findUnique.mockResolvedValue(mockTodo);
      mockPrismaService.todo.delete.mockResolvedValue(mockTodo);

      const result = await service.remove(mockTodo.id, mockUser.id);

 
      expect(mockPrismaService.todo.findUnique).toHaveBeenCalledWith({
        where: { id: mockTodo.id },
      });
      expect(mockPrismaService.todo.delete).toHaveBeenCalledWith({
        where: { id: mockTodo.id },
      });
      expect(result).toEqual({ message: 'Todo removido com sucesso' });
    });

    it('should throw NotFoundException when todo does not exist', async () => {

      mockPrismaService.todo.findUnique.mockResolvedValue(null);


      await expect(service.remove('nonexistent-id', mockUser.id)).rejects.toThrow(
        new NotFoundException('Todo não encontrado'),
      );
    });

    it('should throw ForbiddenException when user does not own the todo', async () => {

      const todoWithDifferentUser = { ...mockTodo, userId: 'different-user' };
      mockPrismaService.todo.findUnique.mockResolvedValue(todoWithDifferentUser);


      await expect(service.remove(mockTodo.id, mockUser.id)).rejects.toThrow(
        new ForbiddenException('Você não tem permissão para deletar este todo'),
      );
    });
  });

  describe('getStatistics', () => {
    it('should return correct statistics', async () => {
 
      mockPrismaService.todo.count
        .mockResolvedValueOnce(10) 
        .mockResolvedValueOnce(3) 
        .mockResolvedValueOnce(2)  
        .mockResolvedValueOnce(5); 


      const result = await service.getStatistics(mockUser.id);


      expect(mockPrismaService.todo.count).toHaveBeenCalledTimes(4);
      expect(mockPrismaService.todo.count).toHaveBeenNthCalledWith(1, {
        where: { userId: mockUser.id },
      });
      expect(mockPrismaService.todo.count).toHaveBeenNthCalledWith(2, {
        where: { userId: mockUser.id, status: 'PENDING' },
      });
      expect(mockPrismaService.todo.count).toHaveBeenNthCalledWith(3, {
        where: { userId: mockUser.id, status: 'STARTED' },
      });
      expect(mockPrismaService.todo.count).toHaveBeenNthCalledWith(4, {
        where: { userId: mockUser.id, status: 'DONE' },
      });

      expect(result).toEqual({
        total: 10,
        pending: 3,
        started: 2,
        done: 5,
        completion_rate: 50,
      });
    });

    it('should return 0 completion rate when no todos exist', async () => {

      mockPrismaService.todo.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0) 
        .mockResolvedValueOnce(0) 
        .mockResolvedValueOnce(0); 

 
      const result = await service.getStatistics(mockUser.id);


      expect(result).toEqual({
        total: 0,
        pending: 0,
        started: 0,
        done: 0,
        completion_rate: 0,
      });
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});