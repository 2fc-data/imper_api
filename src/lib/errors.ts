import { HttpException, HttpStatus } from '@nestjs/common';

export class AppError extends HttpException {
  constructor(
    status: number,
    message: string,
  ) {
    super(message, status);
    this.name = 'AppError';
  }
}
