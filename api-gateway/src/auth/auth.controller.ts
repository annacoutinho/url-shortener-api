import {
  Body,
  Controller,
  Logger,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Usuário registrado com sucesso' })
  @ApiResponse({ status: 409, description: 'E-mail já registrado' })
  async register(@Body() dto: RegisterDto) {
    this.logger.log(`Tentando registrar usuário: ${dto.email}`);
    const user = await this.authService.register(dto);
    this.logger.log(`Usuário registrado com sucesso: ${dto.email}`);
    return user;
  }

  @Post('login')
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() dto: LoginDto) {
    this.logger.log(`Tentando login para: ${dto.email}`);
    const result = await this.authService.login(dto);
    this.logger.log(`Login realizado para: ${dto.email}`);
    return result;
  }
}
