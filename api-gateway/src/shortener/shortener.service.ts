import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { UserShortUrl } from './interfaces/user-short-url.interface';
import { UpdateShortUrlDto } from './dto/update-short-url.dto';

@Injectable()
export class ShortenerService {
  constructor(private readonly prisma: PrismaService) {}

  async createShortUrl(
    dto: CreateShortUrlDto,
    userId?: string,
  ): Promise<{ shortUrl: string }> {
    const hash = await this.generateUniqueHash();

    const newShortUrl = await this.prisma.shortUrl.create({
      data: {
        originalUrl: dto.originalUrl,
        hash,
        userId,
      },
    });

    return { shortUrl: this.buildShortUrl(newShortUrl.hash) };
  }

  private async generateUniqueHash(): Promise<string> {
    let hash: string;
    let exists = true;

    do {
      hash = randomBytes(3).toString('base64url').slice(0, 6);
      const found = await this.prisma.shortUrl.findUnique({
        where: { hash },
      });
      exists = !!found;
    } while (exists);

    return hash;
  }

  private buildShortUrl(hash: string): string {
    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
      throw new Error('Variável BASE_URL não está definida no ambiente (.env)');
    }
    return `${baseUrl}/${hash}`;
  }

  async getAndCount(hash: string): Promise<{ originalUrl: string } | null> {
    const shortUrl = await this.prisma.shortUrl.findFirst({
      where: {
        hash,
        deletedAt: null,
      },
    });

    if (!shortUrl) {
      return null;
    }

    await this.prisma.shortUrl.update({
      where: { id: shortUrl.id },
      data: { clicks: { increment: 1 } },
    });

    return { originalUrl: shortUrl.originalUrl };
  }

  async getMyUrls(userId: string): Promise<UserShortUrl[]> {
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
    const existing = await this.prisma.shortUrl.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException('URL não encontrada ou não pertence ao usuário');
    }

    await this.prisma.shortUrl.update({
      where: { id },
      data: {
        originalUrl: dto.originalUrl,
        updatedAt: new Date(),
      },
    });
  }

  async deleteShortUrl(id: string, userId: string): Promise<void> {
    const url = await this.prisma.shortUrl.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    });

    if (!url) {
      throw new NotFoundException('URL não encontrada ou já deletada');
    }

    await this.prisma.shortUrl.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
