import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';


const mockUser = {
  id: 'clx1a2b3c4d5e6f7g8h9',
  name: 'John Doe',
  email: 'john@example.com',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockUserWithTodos = {
  ...mockUser,
  todos: [
    {
      id: 'todo1',
      title: 'Test Todo',
      description: 'Test Description',
      status: 'PENDING',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ],
};

const mockUsersWithCount = [
  {
    ...mockUser,
    _count: { todos: 2 },
  },
];

const mockCreateUserDto: CreateUserDto = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
};

const mockUpdateUserDto: UpdateUserDto = {
  name: 'Updated Name',
};


const mockUserService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);


    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user', async () => {

      mockUserService.create.mockResolvedValue(mockUser);


      const result = await controller.create(mockCreateUserDto);


      expect(service.create).toHaveBeenCalledWith(mockCreateUserDto);
      expect(result).toEqual(mockUser);
    });

    it('should call service.create with correct parameters', async () => {

      mockUserService.create.mockResolvedValue(mockUser);


      await controller.create(mockCreateUserDto);


      expect(service.create).toHaveBeenCalledTimes(1);
      expect(service.create).toHaveBeenCalledWith(mockCreateUserDto);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {

      mockUserService.findAll.mockResolvedValue(mockUsersWithCount);


      const result = await controller.findAll();


      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUsersWithCount);
    });

    it('should return empty array when no users exist', async () => {

      mockUserService.findAll.mockResolvedValue([]);


      const result = await controller.findAll();


      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {

      const userId = 'clx1a2b3c4d5e6f7g8h9';
      mockUserService.findOne.mockResolvedValue(mockUserWithTodos);


      const result = await controller.findOne(userId);


      expect(service.findOne).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUserWithTodos);
    });

    it('should call service.findOne with correct id', async () => {

      const userId = 'test-user-id';
      mockUserService.findOne.mockResolvedValue(mockUserWithTodos);


      await controller.findOne(userId);


      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(service.findOne).toHaveBeenCalledWith(userId);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {

      const userId = 'clx1a2b3c4d5e6f7g8h9';
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      mockUserService.update.mockResolvedValue(updatedUser);


      const result = await controller.update(userId, mockUpdateUserDto);


      expect(service.update).toHaveBeenCalledWith(userId, mockUpdateUserDto);
      expect(result).toEqual(updatedUser);
    });

    it('should call service.update with correct parameters', async () => {

      const userId = 'test-user-id';
      const updateDto = { email: 'newemail@example.com' };
      mockUserService.update.mockResolvedValue(mockUser);


      await controller.update(userId, updateDto);


      expect(service.update).toHaveBeenCalledTimes(1);
      expect(service.update).toHaveBeenCalledWith(userId, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {

      const userId = 'clx1a2b3c4d5e6f7g8h9';
      const deleteResponse = { message: 'Usuário removido com sucesso' };
      mockUserService.remove.mockResolvedValue(deleteResponse);


      const result = await controller.remove(userId);


      expect(service.remove).toHaveBeenCalledWith(userId);
      expect(result).toEqual(deleteResponse);
    });

    it('should call service.remove with correct id', async () => {

      const userId = 'test-user-id';
      mockUserService.remove.mockResolvedValue({ message: 'Success' });


      await controller.remove(userId);


      expect(service.remove).toHaveBeenCalledTimes(1);
      expect(service.remove).toHaveBeenCalledWith(userId);
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});