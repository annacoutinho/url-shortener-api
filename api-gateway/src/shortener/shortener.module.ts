import { Module } from '@nestjs/common';
import { ShortenerController } from './shortener.controller';
import { ShortenerService } from './shortener.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ShortenerController],
  providers: [ShortenerService, PrismaService]
})
export class ShortenerModule {}
