import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './services/auth.service';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwt: any;
  let bcrypt: any;

  const anna = {
    id: 1,
    email: 'anna@hotmail.com',
    password: 'hash_da_senha',
    createdAt: new Date('2024-01-15'),
  };

  beforeEach(async () => {
    bcrypt = require('bcryptjs');

    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    jwt = { sign: jest.fn() };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  describe('quando Anna tenta se registrar', () => {
    const dadosRegistro = {
      email: 'anna@hotmail.com',
      password: 'minhaSenha123',
    };

    it('funciona quando é um email novo', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hash_da_senha');
      prisma.user.create.mockResolvedValue(anna);

      const resultado = await service.register(dadosRegistro);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'anna@hotmail.com' },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('minhaSenha123', 10);
      expect(resultado).toEqual({
        id: 1,
        email: 'anna@hotmail.com',
        createdAt: new Date('2024-01-15'),
      });
    });

    it('falha quando o email já existe', async () => {
      prisma.user.findUnique.mockResolvedValue(anna);

      await expect(service.register(dadosRegistro)).rejects.toThrow(
        'E-mail já registrado',
      );

      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('quando Anna tenta fazer login', () => {
    const dadosLogin = {
      email: 'anna@hotmail.com',
      password: 'minhaSenha123',
    };

    it('funciona com senha correta', async () => {
      prisma.user.findUnique.mockResolvedValue(anna);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('token_gerado');

      const resultado = await service.login(dadosLogin);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'minhaSenha123',
        'hash_da_senha',
      );
      expect(jwt.sign).toHaveBeenCalledWith({
        sub: 1,
        email: 'anna@hotmail.com',
      });
      expect(resultado).toEqual({ access_token: 'token_gerado' });
    });

    it('falha quando usuário não existe', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(dadosLogin)).rejects.toThrow(
        'Credenciais inválidas',
      );
    });

    it('falha com senha errada', async () => {
      prisma.user.findUnique.mockResolvedValue(anna);
      bcrypt.compare.mockResolvedValue(false);

      await expect(service.login(dadosLogin)).rejects.toThrow(
        'Credenciais inválidas',
      );

      expect(jwt.sign).not.toHaveBeenCalled();
    });
  });

  describe('detalhes técnicos', () => {
    it('usa salt 10 para hash da senha', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hash_da_senha');
      prisma.user.create.mockResolvedValue(anna);

      await service.register({ email: 'anna@hotmail.com', password: 'teste' });

      expect(bcrypt.hash).toHaveBeenCalledWith('teste', 10);
    });

    it('monta payload JWT corretamente', async () => {
      prisma.user.findUnique.mockResolvedValue(anna);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('token');

      await service.login({ email: 'anna@hotmail.com', password: 'teste' });

      expect(jwt.sign).toHaveBeenCalledWith({
        sub: anna.id,
        email: anna.email,
      });
    });
  });
});
