import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { UserShortUrl } from './interfaces/user-short-url.interface';
import { UpdateShortUrlDto } from './dto/update-short-url.dto';

@Injectable()
export class ShortenerService {
  private readonly logger = new Logger(ShortenerService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createShortUrl(
    dto: CreateShortUrlDto,
    userId?: string,
  ): Promise<{ shortUrl: string }> {
    this.logger.log(`Criando URL encurtada para: ${dto.originalUrl}`);

    const hash = await this.generateUniqueHash();

    const newShortUrl = await this.prisma.shortUrl.create({
      data: {
        originalUrl: dto.originalUrl,
        hash,
        userId,
      },
    });

    const shortUrl = this.buildShortUrl(newShortUrl.hash);
    this.logger.log(`URL encurtada criada: ${shortUrl}`);

    return { shortUrl };
  }

  private async generateUniqueHash(): Promise<string> {
    let hash: string;
    let exists = true;

    do {
      hash = randomBytes(3).toString('base64url').slice(0, 6);
      const found = await this.prisma.shortUrl.findUnique({ where: { hash } });
      exists = !!found;
    } while (exists);

    return hash;
  }

  private buildShortUrl(hash: string): string {
    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
      this.logger.error('Variável BASE_URL não está definida no ambiente');
      throw new Error('Variável BASE_URL não está definida no ambiente (.env)');
    }
    return `${baseUrl}/${hash}`;
  }

  async getAndCount(hash: string): Promise<{ originalUrl: string } | null> {
    this.logger.log(`Buscando URL original para hash: ${hash}`);

    const shortUrl = await this.prisma.shortUrl.findFirst({
      where: {
        hash,
        deletedAt: null,
      },
    });

    if (!shortUrl) {
      this.logger.warn(`URL não encontrada para hash: ${hash}`);
      return null;
    }

    await this.prisma.shortUrl.update({
      where: { id: shortUrl.id },
      data: { clicks: { increment: 1 } },
    });

    this.logger.log(`Clique registrado para hash: ${hash}`);

    return { originalUrl: shortUrl.originalUrl };
  }

  async getMyUrls(userId: string): Promise<UserShortUrl[]> {
    this.logger.log(`Listando URLs do usuário: ${userId}`);

    const urls = await this.prisma.shortUrl.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    return urls.map((url) => ({
      id: url.id,
      originalUrl: url.originalUrl,
      shortUrl: `${process.env.BASE_URL}/${url.hash}`,
      clicks: url.clicks,
      createdAt: url.createdAt,
    }));
  }

  async updateShortUrl(
    id: string,
    userId: string,
    dto: UpdateShortUrlDto,
  ): Promise<void> {
    this.logger.log(`Atualizando URL ${id} do usuário ${userId}`);

    const existing = await this.prisma.shortUrl.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    });

    if (!existing) {
      this.logger.warn(`URL ${id} não encontrada para usuário ${userId}`);
      throw new NotFoundException('URL não encontrada ou não pertence ao usuário');
    }

    await this.prisma.shortUrl.update({
      where: { id },
      data: {
        originalUrl: dto.originalUrl,
        updatedAt: new Date(),
      },
    });

    this.logger.log(`URL ${id} atualizada com sucesso`);
  }

  async deleteShortUrl(id: string, userId: string): Promise<void> {
    this.logger.log(`Deletando URL ${id} do usuário ${userId}`);

    const url = await this.prisma.shortUrl.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    });

    if (!url) {
      this.logger.warn(`URL ${id} não encontrada ou já deletada`);
      throw new NotFoundException('URL não encontrada ou já deletada');
    }

    await this.prisma.shortUrl.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    this.logger.log(`URL ${id} deletada com sucesso`);
  }
}
