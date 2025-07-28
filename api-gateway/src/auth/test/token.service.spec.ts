import { JwtService } from '@nestjs/jwt';
import { TokenService } from '../services/token.service';

describe('TokenService', () => {
  let service: TokenService;
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = { sign: jest.fn() } as any;
    service = new TokenService(jwtService);
  });

  it('gera token corretamente com sub e email', () => {
    (jwtService.sign as jest.Mock).mockReturnValue('token_falso');

    const token = service.generateToken('1', 'anna@example.com');

    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: '1',
      email: 'anna@example.com',
    });
    expect(token).toBe('token_falso');
  });
});
