import { ApiProperty } from '@nestjs/swagger';

export class ShortUrlResponseDto {
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
    description: 'URL encurtada gerada pelo sistema',
  })
  shortUrl: string;

  @ApiProperty({
    example: 42,
    description: 'Número de vezes que a URL encurtada foi acessada',
  })
  clicks: number;

  @ApiProperty({
    example: '2025-07-26T14:00:00.000Z',
    description: 'Data e hora de criação da URL encurtada',
  })
  createdAt: Date;
}
