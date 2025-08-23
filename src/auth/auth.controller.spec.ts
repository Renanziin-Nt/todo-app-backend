import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';


const mockLoginDto: LoginDto = {
  email: 'john@example.com',
  password: 'password123',
};

const mockRegisterDto: RegisterDto = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
};

const mockLoginResponse = {
  access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token',
  user: {
    id: 'clx1a2b3c4d5e6f7g8h9',
    name: 'John Doe',
    email: 'john@example.com',
  },
};

const mockUser = {
  id: 'clx1a2b3c4d5e6f7g8h9',
  name: 'John Doe',
  email: 'john@example.com',
};

const mockRequest = {
  user: mockUser,
};


const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  validateJwtPayload: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);


    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {

      mockAuthService.register.mockResolvedValue(mockLoginResponse);


      const result = await controller.register(mockRegisterDto);


      expect(authService.register).toHaveBeenCalledWith(mockRegisterDto);
      expect(result).toEqual(mockLoginResponse);
    });

    it('should call authService.register with correct parameters', async () => {
   
      mockAuthService.register.mockResolvedValue(mockLoginResponse);

  
      await controller.register(mockRegisterDto);


      expect(authService.register).toHaveBeenCalledTimes(1);
      expect(authService.register).toHaveBeenCalledWith(mockRegisterDto);
    });

    it('should propagate errors from authService.register', async () => {
    
      const error = new Error('Email já está em uso');
      mockAuthService.register.mockRejectedValue(error);

  
      await expect(controller.register(mockRegisterDto)).rejects.toThrow(error);
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {

      mockAuthService.login.mockResolvedValue(mockLoginResponse);


      const result = await controller.login(mockLoginDto);

      
      expect(authService.login).toHaveBeenCalledWith(
        mockLoginDto.email,
        mockLoginDto.password,
      );
      expect(result).toEqual(mockLoginResponse);
    });

    it('should call authService.login with correct parameters', async () => {
  
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

     
      await controller.login(mockLoginDto);

  
      expect(authService.login).toHaveBeenCalledTimes(1);
      expect(authService.login).toHaveBeenCalledWith(
        mockLoginDto.email,
        mockLoginDto.password,
      );
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {

      const unauthorizedException = new UnauthorizedException('Credenciais inválidas');
      mockAuthService.login.mockRejectedValue(unauthorizedException);


      await expect(controller.login(mockLoginDto)).rejects.toThrow(
        unauthorizedException,
      );
    });

    it('should handle different login scenarios', async () => {
  
      const differentLoginDto = {
        email: 'different@example.com',
        password: 'differentpassword',
      };
      mockAuthService.login.mockResolvedValue(mockLoginResponse);


      await controller.login(differentLoginDto);

    
      expect(authService.login).toHaveBeenCalledWith(
        differentLoginDto.email,
        differentLoginDto.password,
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile with success message', async () => {

      const result = controller.getProfile(mockRequest);

   
      expect(result).toEqual({
        message: 'Acesso autorizado',
        user: mockUser,
      });
    });

    it('should return profile for different users', async () => {

      const differentUser = {
        id: 'different-id',
        name: 'Different User',
        email: 'different@example.com',
      };
      const differentRequest = { user: differentUser };


      const result = controller.getProfile(differentRequest);


      expect(result).toEqual({
        message: 'Acesso autorizado',
        user: differentUser,
      });
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user data', async () => {

      const result = controller.getCurrentUser(mockRequest);


      expect(result).toEqual(mockUser);
    });

    it('should return current user for different users', async () => {

      const differentUser = {
        id: 'different-id',
        name: 'Different User',
        email: 'different@example.com',
      };
      const differentRequest = { user: differentUser };


      const result = controller.getCurrentUser(differentRequest);

      expect(result).toEqual(differentUser);
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});