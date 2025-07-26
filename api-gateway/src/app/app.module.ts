import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ShortenerModule } from 'src/shortener/shortener.module';

@Module({
  imports: [AuthModule, ShortenerModule],
})
export class AppModule {}
