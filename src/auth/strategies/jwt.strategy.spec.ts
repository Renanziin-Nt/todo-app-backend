import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { AuthService, JwtPayload } from '../auth.service';

// Mock data
const mockJwtPayload: JwtPayload = {
  sub: 'clx1a2b3c4d5e6f7g8h9',
  email: 'john@example.com',
  name: 'John Doe',
};

const mockUser = {
  id: 'clx1a2b3c4d5e6f7g8h9',
  name: 'John Doe',
  email: 'john@example.com',
};


const mockAuthService = {
  validateJwtPayload: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should return user data when JWT payload is valid', async () => {

      mockAuthService.validateJwtPayload.mockResolvedValue(mockUser);

  
      const result = await strategy.validate(mockJwtPayload);

      expect(authService.validateJwtPayload).toHaveBeenCalledWith(mockJwtPayload);
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException when JWT payload is invalid', async () => {

      mockAuthService.validateJwtPayload.mockRejectedValue(
        new Error('User not found'),
      );


      await expect(strategy.validate(mockJwtPayload)).rejects.toThrow(
        new UnauthorizedException('Token inválido'),
      );
    });

    it('should throw UnauthorizedException when authService throws UnauthorizedException', async () => {

      const originalError = new UnauthorizedException('Token inválido');
      mockAuthService.validateJwtPayload.mockRejectedValue(originalError);

  
      await expect(strategy.validate(mockJwtPayload)).rejects.toThrow(
        new UnauthorizedException('Token inválido'),
      );
    });

    it('should call validateJwtPayload with correct payload', async () => {

      mockAuthService.validateJwtPayload.mockResolvedValue(mockUser);
      const differentPayload = {
        sub: 'different-id',
        email: 'different@example.com',
        name: 'Different User',
      };

 
      await strategy.validate(differentPayload);

      expect(authService.validateJwtPayload).toHaveBeenCalledTimes(1);
      expect(authService.validateJwtPayload).toHaveBeenCalledWith(differentPayload);
    });
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });
});