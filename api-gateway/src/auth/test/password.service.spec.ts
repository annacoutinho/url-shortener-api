import { PasswordService } from '../services/password.service';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(() => {
    service = new PasswordService();
    jest.clearAllMocks();
  });

  it('deve hashear a senha corretamente', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_senha');

    const result = await service.hash('minhaSenha');
    expect(bcrypt.hash).toHaveBeenCalledWith('minhaSenha', 10);
    expect(result).toBe('hashed_senha');
  });

  it('deve comparar a senha com hash', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await service.compare('senha', 'hash');
    expect(bcrypt.compare).toHaveBeenCalledWith('senha', 'hash');
    expect(result).toBe(true);
  });
});
