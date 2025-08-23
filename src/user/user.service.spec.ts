import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';


jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));


const mockUser = {
  id: 'clx1a2b3c4d5e6f7g8h9',
  name: 'John Doe',
  email: 'john@example.com',
  password: 'hashedPassword123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockUserWithoutPassword = {
  id: 'clx1a2b3c4d5e6f7g8h9',
  name: 'John Doe',
  email: 'john@example.com',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockCreateUserDto = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
};


const mockPrismaService = {
  user: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;
  const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);


    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue('hashedPassword123' as never);
      mockPrismaService.user.create.mockResolvedValue(mockUserWithoutPassword);

      const result = await service.create(mockCreateUserDto);


      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockCreateUserDto.email },
      });
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(mockCreateUserDto.password, 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: mockCreateUserDto.name,
          email: mockCreateUserDto.email,
          password: 'hashedPassword123',
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual(mockUserWithoutPassword);
    });

    it('should throw ConflictException when email already exists', async () => {

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);


      await expect(service.create(mockCreateUserDto)).rejects.toThrow(
        new ConflictException('Email já está em uso'),
      );
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all users with todo count', async () => {

      const mockUsersWithCount = [
        {
          ...mockUserWithoutPassword,
          _count: { todos: 5 },
        },
      ];
      mockPrismaService.user.findMany.mockResolvedValue(mockUsersWithCount);

      const result = await service.findAll();


      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { todos: true },
          },
        },
      });
      expect(result).toEqual(mockUsersWithCount);
    });
  });

  describe('findOne', () => {
    it('should return a user with todos', async () => {

      const mockUserWithTodos = {
        ...mockUserWithoutPassword,
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
      mockPrismaService.user.findUnique.mockResolvedValue(mockUserWithTodos);


      const result = await service.findOne(mockUser.id);


      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
          todos: {
            select: {
              id: true,
              title: true,
              description: true,
              status: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });
      expect(result).toEqual(mockUserWithTodos);
    });

    it('should throw NotFoundException when user not found', async () => {

      mockPrismaService.user.findUnique.mockResolvedValue(null);


      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        new NotFoundException('Usuário não encontrado'),
      );
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);


      const result = await service.findByEmail(mockUser.email);


      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockUser.email },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    const updateDto = { name: 'Updated Name' };

    it('should update user successfully', async () => {

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUserWithoutPassword,
        name: 'Updated Name',
      });


      const result = await service.update(mockUser.id, updateDto);


      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: updateDto,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result.name).toBe('Updated Name');
    });

    it('should throw NotFoundException when user not found', async () => {

      mockPrismaService.user.findUnique.mockResolvedValue(null);


      await expect(service.update('nonexistent-id', updateDto)).rejects.toThrow(
        new NotFoundException('Usuário não encontrado'),
      );
    });

    it('should hash password when updating password', async () => {

      const updateDtoWithPassword = { password: 'newPassword123' };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockedBcrypt.hash.mockResolvedValue('newHashedPassword' as never);
      mockPrismaService.user.update.mockResolvedValue(mockUserWithoutPassword);


      await service.update(mockUser.id, updateDtoWithPassword);

      expect(mockedBcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          password: 'newPassword123',
          password: 'newHashedPassword',
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });
  });

  describe('remove', () => {
    it('should remove user successfully', async () => {

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      const result = await service.remove(mockUser.id);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(result).toEqual({ message: 'Usuário removido com sucesso' });
    });

    it('should throw NotFoundException when user not found', async () => {

      mockPrismaService.user.findUnique.mockResolvedValue(null);

 
      await expect(service.remove('nonexistent-id')).rejects.toThrow(
        new NotFoundException('Usuário não encontrado'),
      );
    });
  });
});