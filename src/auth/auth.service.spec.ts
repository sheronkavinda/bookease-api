import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;

  const usersServiceMock = {
    findByEmail: jest.fn<
      () => Promise<{
        id: string;
        name: string;
        email: string;
      } | null>
    >(),
    create: jest.fn(),
  };

  const jwtServiceMock = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should reject registration when email already exists', async () => {
    usersServiceMock.findByEmail.mockResolvedValue({
      id: 'user-id',
      name: 'Existing User',
      email: 'test@example.com',
    });

    await expect(
      authService.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
      }),
    ).rejects.toThrow(ConflictException);

    expect(usersServiceMock.create).not.toHaveBeenCalled();
  });

  it('should reject login when email does not exist', async () => {
    usersServiceMock.findByEmail.mockResolvedValue(null);

    await expect(
      authService.login({
        email: 'missing@example.com',
        password: 'Password123',
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
  });
});
