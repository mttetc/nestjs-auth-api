import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '@/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenBlacklistService } from './token-blacklist.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { Prisma, User, UserRole } from 'generated/prisma';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let tokenBlacklistService: TokenBlacklistService;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    role: UserRole.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const cookieMock = jest.fn();
  const clearCookieMock = jest.fn();
  const mockResponse = {
    cookie: cookieMock,
    clearCookie: clearCookieMock,
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOneByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verifyAsync: jest.fn(),
            decode: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
        {
          provide: TokenBlacklistService,
          useValue: {
            addToBlacklist: jest.fn(),
            isBlacklisted: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    tokenBlacklistService = module.get<TokenBlacklistService>(
      TokenBlacklistService,
    );
  });

  describe('register', () => {
    const registerDto: Prisma.UserCreateInput = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should throw ConflictException if email already exists', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(mockUser);

      await expect(service.register(registerDto, mockResponse)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should successfully register a new user', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);
      jest.spyOn(usersService, 'create').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue('test-token');

      const result = await service.register(registerDto, mockResponse);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(cookieMock).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should throw UnauthorizedException for invalid credentials', async () => {
      jest.spyOn(service, 'validateUser').mockResolvedValue(null);

      await expect(
        service.login(loginDto.email, loginDto.password, mockResponse),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should successfully login a user', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = mockUser;
      jest
        .spyOn(service, 'validateUser')
        .mockResolvedValue(userWithoutPassword);
      jest.spyOn(jwtService, 'sign').mockReturnValue('test-token');

      const result = await service.login(
        loginDto.email,
        loginDto.password,
        mockResponse,
      );

      expect(result).toHaveProperty('accessToken');
      expect(cookieMock).toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    it('should return null for non-existent user', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(null);

      const result = await service.validateUser(
        'test@example.com',
        'password123',
      );
      expect(result).toBeNull();
    });

    it('should return user without password for valid credentials', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.validateUser(
        'test@example.com',
        'password123',
      );
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('logout', () => {
    const token = 'test-token';

    it('should successfully logout user', async () => {
      const decodedToken = { exp: Math.floor(Date.now() / 1000) + 3600 };
      jest.spyOn(jwtService, 'decode').mockReturnValue(decodedToken);
      jest.spyOn(tokenBlacklistService, 'addToBlacklist').mockResolvedValue();

      const result = await service.logout(mockResponse, token);

      expect(result).toEqual({ message: 'Logout successful' });
      expect(clearCookieMock).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      jest.spyOn(jwtService, 'decode').mockReturnValue(null);

      await expect(service.logout(mockResponse, token)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateToken', () => {
    const token = 'test-token';

    it('should return false for blacklisted token', async () => {
      jest
        .spyOn(tokenBlacklistService, 'isBlacklisted')
        .mockResolvedValue(true);

      const result = await service.validateToken(token);
      expect(result).toBe(false);
    });

    it('should return false for invalid token', async () => {
      jest
        .spyOn(tokenBlacklistService, 'isBlacklisted')
        .mockResolvedValue(false);
      jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error());

      const result = await service.validateToken(token);
      expect(result).toBe(false);
    });

    it('should return true for valid token', async () => {
      jest
        .spyOn(tokenBlacklistService, 'isBlacklisted')
        .mockResolvedValue(false);
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({});

      const result = await service.validateToken(token);
      expect(result).toBe(true);
    });
  });
});
