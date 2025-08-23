import { Test, TestingModule } from '@nestjs/testing';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

const mockUser = {
  id: 'user1',
  name: 'John Doe',
  email: 'john@example.com',
};

const mockRequest = {
  user: mockUser,
};

const mockTodo = {
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

const mockStatistics = {
  total: 10,
  pending: 3,
  started: 2,
  done: 5,
  completion_rate: 50,
};

const mockCreateTodoDto: CreateTodoDto = {
  title: 'Test Todo',
  description: 'Test Description',
};

const mockUpdateTodoDto: UpdateTodoDto = {
  title: 'Updated Todo',
  status: 'STARTED' as any,
};


const mockTodoService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  getStatistics: jest.fn(),
};

describe('TodoController', () => {
  let controller: TodoController;
  let service: TodoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [
        {
          provide: TodoService,
          useValue: mockTodoService,
        },
      ],
    }).compile();

    controller = module.get<TodoController>(TodoController);
    service = module.get<TodoService>(TodoService);


    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new todo', async () => {

      mockTodoService.create.mockResolvedValue(mockTodo);


      const result = await controller.create(mockCreateTodoDto, mockRequest);


      expect(service.create).toHaveBeenCalledWith(mockCreateTodoDto, mockUser.id);
      expect(result).toEqual(mockTodo);
    });

    it('should call service.create with correct parameters', async () => {

      mockTodoService.create.mockResolvedValue(mockTodo);


      await controller.create(mockCreateTodoDto, mockRequest);


      expect(service.create).toHaveBeenCalledTimes(1);
      expect(service.create).toHaveBeenCalledWith(mockCreateTodoDto, mockUser.id);
    });
  });

  describe('findAll', () => {
    it('should return all todos for user', async () => {

      mockTodoService.findAll.mockResolvedValue(mockTodos);


      const result = await controller.findAll(mockRequest);


      expect(service.findAll).toHaveBeenCalledWith(mockUser.id, undefined);
      expect(result).toEqual(mockTodos);
    });

    it('should return todos filtered by status', async () => {

      const filteredTodos = [mockTodos[0]];
      mockTodoService.findAll.mockResolvedValue(filteredTodos);


      const result = await controller.findAll(mockRequest, 'PENDING');


      expect(service.findAll).toHaveBeenCalledWith(mockUser.id, 'PENDING');
      expect(result).toEqual(filteredTodos);
    });

    it('should call service.findAll with correct parameters', async () => {

      mockTodoService.findAll.mockResolvedValue(mockTodos);


      await controller.findAll(mockRequest, 'DONE');


      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(service.findAll).toHaveBeenCalledWith(mockUser.id, 'DONE');
    });
  });

  describe('getStatistics', () => {
    it('should return user statistics', async () => {

      mockTodoService.getStatistics.mockResolvedValue(mockStatistics);


      const result = await controller.getStatistics(mockRequest);


      expect(service.getStatistics).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockStatistics);
    });

    it('should call service.getStatistics with correct user id', async () => {

      mockTodoService.getStatistics.mockResolvedValue(mockStatistics);


      await controller.getStatistics(mockRequest);


      expect(service.getStatistics).toHaveBeenCalledTimes(1);
      expect(service.getStatistics).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('findOne', () => {
    it('should return a specific todo', async () => {

      const todoId = 'todo1';
      mockTodoService.findOne.mockResolvedValue(mockTodo);


      const result = await controller.findOne(todoId, mockRequest);


      expect(service.findOne).toHaveBeenCalledWith(todoId, mockUser.id);
      expect(result).toEqual(mockTodo);
    });

    it('should call service.findOne with correct parameters', async () => {

      const todoId = 'specific-todo-id';
      mockTodoService.findOne.mockResolvedValue(mockTodo);


      await controller.findOne(todoId, mockRequest);


      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(service.findOne).toHaveBeenCalledWith(todoId, mockUser.id);
    });
  });

  describe('update', () => {
    it('should update a todo', async () => {

      const todoId = 'todo1';
      const updatedTodo = { ...mockTodo, title: 'Updated Todo', status: 'STARTED' as const };
      mockTodoService.update.mockResolvedValue(updatedTodo);


      const result = await controller.update(todoId, mockUpdateTodoDto, mockRequest);


      expect(service.update).toHaveBeenCalledWith(todoId, mockUpdateTodoDto, mockUser.id);
      expect(result).toEqual(updatedTodo);
    });

    it('should call service.update with correct parameters', async () => {

      const todoId = 'specific-todo-id';
      const updateDto = { title: 'New Title' };
      mockTodoService.update.mockResolvedValue(mockTodo);


      await controller.update(todoId, updateDto, mockRequest);


      expect(service.update).toHaveBeenCalledTimes(1);
      expect(service.update).toHaveBeenCalledWith(todoId, updateDto, mockUser.id);
    });
  });

  describe('remove', () => {
    it('should remove a todo', async () => {

      const todoId = 'todo1';
      const deleteResponse = { message: 'Todo removido com sucesso' };
      mockTodoService.remove.mockResolvedValue(deleteResponse);


      const result = await controller.remove(todoId, mockRequest);


      expect(service.remove).toHaveBeenCalledWith(todoId, mockUser.id);
      expect(result).toEqual(deleteResponse);
    });

    it('should call service.remove with correct parameters', async () => {

      const todoId = 'specific-todo-id';
      mockTodoService.remove.mockResolvedValue({ message: 'Success' });


      await controller.remove(todoId, mockRequest);


      expect(service.remove).toHaveBeenCalledTimes(1);
      expect(service.remove).toHaveBeenCalledWith(todoId, mockUser.id);
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});