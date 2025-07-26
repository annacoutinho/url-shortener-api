import { ApiProperty } from '@nestjs/swagger';

export class UserShortUrlDto {
  @ApiProperty({
    example: '8d9f66ad-845d-4bc1-a6b0-6b824d211dc2',
    description: 'ID único da URL encurtada',
  })
  id: string;

  @ApiProperty({
    example: 'https://www.google.com/meu-site',
    description: 'URL original fornecida pelo usuário',
  })
  originalUrl: string;

  @ApiProperty({
    example: 'http://localhost:3000/qSpbX1',
    description: 'URL encurtada acessível publicamente',
  })
  shortUrl: string;

  @ApiProperty({
    example: 42,
    description: 'Número de acessos (cliques) na URL encurtada',
  })
  clicks: number;

  @ApiProperty({
    example: '2025-07-26T17:54:24.740Z',
    description: 'Data e hora de criação da URL encurtada',
  })
  createdAt: Date;
}
