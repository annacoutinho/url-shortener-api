import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ShortenerService } from './shortener.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ShortenerService', () => {
  let service: ShortenerService;
  let prisma: any;

  const annaUserId = 'anna-123';
  const urlDaAnna = {
    id: '1',
    originalUrl: 'https://github.com/anna',
    hash: 'anna123',
    clicks: 5,
    userId: annaUserId,
    createdAt: new Date('2024-01-15'),
  };

  beforeEach(async () => {
    prisma = {
      shortUrl: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        ShortenerService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(ShortenerService);
    process.env.BASE_URL = 'http://localhost:3000';
    jest.clearAllMocks();
  });

  describe('quando Anna quer encurtar uma URL', () => {
    it('cria link curto para o GitHub dela', async () => {
      jest.spyOn(service as any, 'generateUniqueHash').mockResolvedValue('anna123');
      prisma.shortUrl.create.mockResolvedValue(urlDaAnna);

      const resultado = await service.createShortUrl(
        { originalUrl: 'https://github.com/anna' },
        annaUserId
      );

      expect(resultado.shortUrl).toBe('http://localhost:3000/anna123');
      expect(prisma.shortUrl.create).toHaveBeenCalledWith({
        data: {
          originalUrl: 'https://github.com/anna',
          hash: 'anna123',
          userId: annaUserId,
        },
      });
    });
  });

  describe('quando alguém clica no link da Anna', () => {
    it('redireciona e conta o clique', async () => {
      prisma.shortUrl.findFirst.mockResolvedValue(urlDaAnna);
      prisma.shortUrl.update.mockResolvedValue({});

      const resultado = await service.getAndCount('anna123');

      expect(resultado).toEqual({ originalUrl: 'https://github.com/anna' });
      expect(prisma.shortUrl.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { clicks: { increment: 1 } }
      });
    });

    it('retorna null se o link não existe', async () => {
      prisma.shortUrl.findFirst.mockResolvedValue(null);

      const resultado = await service.getAndCount('link-inexistente');

      expect(resultado).toBeNull();
    });
  });

  describe('quando Anna quer ver seus links', () => {
    it('mostra todos os links dela', async () => {
      prisma.shortUrl.findMany.mockResolvedValue([urlDaAnna]);

      const resultado = await service.getMyUrls(annaUserId);

      expect(resultado).toHaveLength(1);
      expect(resultado[0]).toEqual({
        id: '1',
        originalUrl: 'https://github.com/anna',
        shortUrl: 'http://localhost:3000/anna123',
        clicks: 5,
        createdAt: new Date('2024-01-15'),
      });
    });

    it('retorna lista vazia se ela não tem links', async () => {
      prisma.shortUrl.findMany.mockResolvedValue([]);

      const resultado = await service.getMyUrls(annaUserId);

      expect(resultado).toEqual([]);
    });
  });

  describe('quando Anna quer editar um link', () => {
    it('atualiza o link se for dela', async () => {
      prisma.shortUrl.findFirst.mockResolvedValue(urlDaAnna);
      prisma.shortUrl.update.mockResolvedValue({});

      await service.updateShortUrl('1', annaUserId, {
        originalUrl: 'https://linkedin.com/in/anna'
      });

      expect(prisma.shortUrl.findFirst).toHaveBeenCalledWith({
        where: { id: '1', userId: annaUserId, deletedAt: null },
      });
      expect(prisma.shortUrl.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          originalUrl: 'https://linkedin.com/in/anna',
          updatedAt: expect.any(Date)
        },
      });
    });

    it('falha se tentar editar link de outra pessoa', async () => {
      prisma.shortUrl.findFirst.mockResolvedValue(null);

      await expect(
        service.updateShortUrl('999', annaUserId, {
          originalUrl: 'https://tentativa-hacker.com'
        })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('quando Anna quer deletar um link', () => {
    it('deleta o link dela', async () => {
      prisma.shortUrl.findFirst.mockResolvedValue(urlDaAnna);
      prisma.shortUrl.update.mockResolvedValue({});

      await service.deleteShortUrl('1', annaUserId);

      expect(prisma.shortUrl.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('falha se tentar deletar link que não existe', async () => {
      prisma.shortUrl.findFirst.mockResolvedValue(null);

      await expect(
        service.deleteShortUrl('999', annaUserId)
      ).rejects.toThrow('URL não encontrada');
    });
  });
});
