import { IsNotEmpty, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateShortUrlDto {
  @IsNotEmpty()
  @IsUrl()
  @ApiProperty({ example: 'https://www.novosite.com' })
  originalUrl: string;
}
