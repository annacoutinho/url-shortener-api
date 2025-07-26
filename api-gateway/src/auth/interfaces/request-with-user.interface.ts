import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: {
    sub: string; // ← obrigatório para usar com JWT
    email?: string;
  };
}
