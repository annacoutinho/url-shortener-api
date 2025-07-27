import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
    private tokenService: TokenService,
  ) {}

  async register(dto: RegisterDto) {
    this.logger.log(`Tentativa de registro para o e-mail: ${dto.email}`);

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      this.logger.warn(`E-mail já registrado: ${dto.email}`);
      throw new ConflictException('E-mail já registrado');
    }

    const hashedPassword = await this.passwordService.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
      },
    });

    this.logger.log(`Usuário registrado com sucesso: ${user.email}`);

    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  async login(dto: LoginDto) {
    this.logger.log(`Tentativa de login para o e-mail: ${dto.email}`);

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      this.logger.warn(`Login falhou. Usuário não encontrado: ${dto.email}`);
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const valid = await this.passwordService.compare(dto.password, user.password);

    if (!valid) {
      this.logger.warn(`Login falhou. Senha incorreta para: ${dto.email}`);
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const token = this.tokenService.generateToken(user.id, user.email);

    this.logger.log(`Login bem-sucedido para: ${dto.email}`);

    return { access_token: token };
  }
}
