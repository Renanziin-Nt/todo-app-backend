import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';


jest.mock('bcrypt', () => ({
  compare: jest.fn(),
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

const mockJwtPayload = {
  sub: 'clx1a2b3c4d5e6f7g8h9',
  email: 'john@example.com',
  name: 'John Doe',
};

const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token';


const mockUserService = {
  findByEmail: jest.fn(),
  create: jest.fn(),
  findOne: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);


    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user data without password when credentials are valid', async () => {

      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);


      const result = await service.validateUser('john@example.com', 'password123');


      expect(mockUserService.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password);
      expect(result).toEqual(mockUserWithoutPassword);
    });

    it('should return null when user is not found', async () => {

      mockUserService.findByEmail.mockResolvedValue(null);


      const result = await service.validateUser('nonexistent@example.com', 'password123');


      expect(mockUserService.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {

      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);


      const result = await service.validateUser('john@example.com', 'wrongpassword');


      expect(mockUserService.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('wrongpassword', mockUser.password);
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token and user data when credentials are valid', async () => {

      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockJwtService.sign.mockReturnValue(mockToken);


      const result = await service.login('john@example.com', 'password123');


      expect(mockUserService.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password);
      expect(mockJwtService.sign).toHaveBeenCalledWith(mockJwtPayload);
      expect(result).toEqual({
        access_token: mockToken,
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
        },
      });
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {

      mockUserService.findByEmail.mockResolvedValue(null);


      await expect(
        service.login('nonexistent@example.com', 'password123'),
      ).rejects.toThrow(new UnauthorizedException('Credenciais inválidas'));
    });

    it('should throw UnauthorizedException when password is wrong', async () => {

      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);


      await expect(
        service.login('john@example.com', 'wrongpassword'),
      ).rejects.toThrow(new UnauthorizedException('Credenciais inválidas'));
    });
  });

  describe('register', () => {
    it('should create user and return access token', async () => {

      mockUserService.create.mockResolvedValue(mockUserWithoutPassword);
      mockJwtService.sign.mockReturnValue(mockToken);


      const result = await service.register(mockCreateUserDto);


      expect(mockUserService.create).toHaveBeenCalledWith(mockCreateUserDto);
      expect(mockJwtService.sign).toHaveBeenCalledWith(mockJwtPayload);
      expect(result).toEqual({
        access_token: mockToken,
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
        },
      });
    });

    it('should propagate UserService errors during registration', async () => {

      const error = new Error('Email já está em uso');
      mockUserService.create.mockRejectedValue(error);


      await expect(service.register(mockCreateUserDto)).rejects.toThrow(error);
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('validateJwtPayload', () => {
    it('should return user data when payload is valid', async () => {

      mockUserService.findOne.mockResolvedValue({
        ...mockUserWithoutPassword,
        todos: [],
      });


      const result = await service.validateJwtPayload(mockJwtPayload);


      expect(mockUserService.findOne).toHaveBeenCalledWith(mockJwtPayload.sub);
      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
      });
    });

    it('should throw UnauthorizedException when user is not found', async () => {

      mockUserService.findOne.mockRejectedValue(new Error('User not found'));


      await expect(service.validateJwtPayload(mockJwtPayload)).rejects.toThrow(
        new UnauthorizedException('Token inválido'),
      );
    });

    it('should throw UnauthorizedException when user service returns null', async () => {

      mockUserService.findOne.mockResolvedValue(null);


      await expect(service.validateJwtPayload(mockJwtPayload)).rejects.toThrow(
        new UnauthorizedException('Token inválido'),
      );
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});