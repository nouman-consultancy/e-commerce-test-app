import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('signed.jwt.token'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register()', () => {
    const dto = { email: 'new@test.com', password: 'plaintext123', name: 'Test User' };
    const createdUser = { id: 'u1', email: dto.email, name: dto.name, role: 'customer', password: '$2b$12$hash' };

    beforeEach(() => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$12$hash');
      mockUsersService.create.mockResolvedValue(createdUser);
    });

    it('stores a bcrypt hash, not the plaintext password', async () => {
      await service.register(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 12);
      expect(mockUsersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ password: '$2b$12$hash' }),
      );
      const storedPassword = (mockUsersService.create.mock.calls[0][0] as { password: string }).password;
      expect(storedPassword).not.toBe(dto.password);
    });
  });

  describe('login()', () => {
    const dto = { email: 'user@test.com', password: 'correct' };
    const storedUser = {
      id: 'u2',
      email: dto.email,
      name: 'User',
      role: 'customer',
      password: '$2b$12$stored',
    };

    it('throws UnauthorizedException for wrong password', async () => {
      mockUsersService.findByEmail.mockResolvedValue(storedUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('returns a string access_token for correct credentials', async () => {
      mockUsersService.findByEmail.mockResolvedValue(storedUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(dto);

      expect(result).toHaveProperty('access_token');
      expect(typeof result.access_token).toBe('string');
    });
  });
});
