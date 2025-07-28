import { Test } from '@nestjs/testing';
import { AuthService } from '../services/auth.service';
import { PasswordService } from '../services/password.service';
import { TokenService } from '../services/token.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let passwordService: any;
  let tokenService: any;

  const user = {
    id: '1',
    email: 'anna@hotmail.com',
    password: 'hashed_password',
    createdAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    passwordService = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    tokenService = {
      generateToken: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: PasswordService, useValue: passwordService },
        { provide: TokenService, useValue: tokenService },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    const dto = { email: 'anna@example.com', password: '123456' };

    it('registra com sucesso quando o e-mail é novo', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      passwordService.hash.mockResolvedValue('hashed_password');
      prisma.user.create.mockResolvedValue(user);

      const result = await service.register(dto);

      expect(result).toEqual({
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      });
    });

    it('lança erro se e-mail já estiver registrado', async () => {
      prisma.user.findUnique.mockResolvedValue(user);

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    const dto = { email: 'anna@example.com', password: '123456' };

    it('realiza login com sucesso com credenciais válidas', async () => {
      prisma.user.findUnique.mockResolvedValue(user);
      passwordService.compare.mockResolvedValue(true);
      tokenService.generateToken.mockReturnValue('fake_token');

      const result = await service.login(dto);

      expect(result).toEqual({ access_token: 'fake_token' });
    });

    it('lança erro se o e-mail não for encontrado', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('lança erro se a senha estiver incorreta', async () => {
      prisma.user.findUnique.mockResolvedValue(user);
      passwordService.compare.mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
