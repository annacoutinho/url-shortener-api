import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Usuário registrado com sucesso' })
  @ApiResponse({ status: 400, description: 'Usuário já existe' })
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto);
    if (!user) {
      throw new HttpException('Usuário já existe', HttpStatus.BAD_REQUEST);
    }
    return user;
  }

  @Post('login')
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
