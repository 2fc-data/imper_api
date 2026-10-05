import { HttpException } from '@nestjs/common';

export class AppError extends HttpException {
  constructor(status: number, message: string | Record<string, unknown>) {
    super(message, status);
    this.name = 'AppError';
  }
}
