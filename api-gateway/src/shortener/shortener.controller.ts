import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { ShortenerService } from './shortener.service';
import { UserShortUrlDto } from './dto/user-short-url.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { UserShortUrl } from './interfaces/user-short-url.interface';
import { UpdateShortUrlDto } from './dto/update-short-url.dto';


@ApiTags('Shortener')
@Controller('shorten')
export class ShortenerController {
  constructor(private readonly shortenerService: ShortenerService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cria uma nova URL encurtada' })
  @ApiResponse({ status: 201, description: 'URL encurtada criada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async create(
    @Body() dto: CreateShortUrlDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;
    return this.shortenerService.createShortUrl(dto, userId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lista todas as URLs encurtadas do usuário autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Lista de URLs do usuário',
    type: UserShortUrlDto,
    isArray: true,
  })
  async getMyUrls(@Req() req: RequestWithUser) {
    const userId = req.user.sub;
    return this.shortenerService.getMyUrls(userId);
  }


  @Get(':hash')
  @ApiOperation({ summary: 'Redireciona a partir de um hash' })
  @ApiParam({ name: 'hash', description: 'Hash da URL encurtada' })
  @ApiResponse({ status: 302, description: 'Redirecionamento para a URL original' })
  @ApiResponse({ status: 404, description: 'URL encurtada não encontrada' })
  async redirectToOriginal(
    @Param('hash') hash: string,
    @Res() res: Response,
  ) {
    const url = await this.shortenerService.getAndCount(hash);

    if (!url) {
      throw new NotFoundException('URL encurtada não encontrada');
    }

    return res.redirect(url.originalUrl);
  }

  @Patch(':id')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Atualiza uma URL encurtada' })
@ApiResponse({ status: 200, description: 'URL atualizada com sucesso' })
@ApiResponse({ status: 404, description: 'URL não encontrada ou não pertence ao usuário' })
async updateShortUrl(
  @Param('id') id: string,
  @Body() dto: UpdateShortUrlDto,
  @Req() req: RequestWithUser,
) {
  const userId = req.user.sub;
  await this.shortenerService.updateShortUrl(id, userId, dto);
  return { message: 'URL atualizada com sucesso' };
}
@Delete(':id')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Deleta logicamente uma URL encurtada' })
@ApiResponse({ status: 200, description: 'URL deletada com sucesso' })
@ApiResponse({ status: 404, description: 'URL não encontrada ou já deletada' })
async deleteShortUrl(
  @Param('id') id: string,
  @Req() req: RequestWithUser,
) {
  const userId = req.user.sub;
  await this.shortenerService.deleteShortUrl(id, userId);
  return { message: 'URL deletada com sucesso' };
}

}
