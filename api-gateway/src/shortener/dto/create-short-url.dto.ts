import { IsNotEmpty, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateShortUrlDto {
  @ApiProperty({
    example: 'https://www.google.com',
    description: 'URL original que será encurtada',
  })
  @IsNotEmpty()
  @IsUrl()
  originalUrl: string;
}
