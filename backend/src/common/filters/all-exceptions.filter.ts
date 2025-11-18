import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaClientKnownRequestError } from 'generated/prisma/runtime/library';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message, error } = this.extractErrorDetails(exception);

    // Логируем только если это НЕ ожидаемая http-ошибка (то есть 500-е или неизвестные баги)
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `End point: ${request.url}, Method: ${request.method}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      // Опционально: логируем ворнинги для 4xx ошибок
      this.logger.warn(
        `End point: ${request.url} Error: ${message}`,
      );
    }

    response.status(status).json({
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    });
  }

  private extractErrorDetails(exception: unknown): {
    status: number;
    message: string | object;
    error: string;
  } {
    // 1. Стандартные HTTP исключения NestJS
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      return {
        status: exception.getStatus(),
        message: (res as any)?.message || exception.message,
        error: (res as any)?.error || exception.name,
      };
    }

    // 2. Ошибки Prisma (проверка по коду или instanceof)
    if (exception instanceof PrismaClientKnownRequestError) {
      const { status, message } = this.mapPrismaError(exception);
      return {
        status,
        message,
        error: 'Database Error',
      };
    }

    // 3. Неизвестные ошибки (500)
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
    };
  }

  private isPrismaError(exception: unknown): any {
    // Простая проверка "утиной типизации", если нет импорта типов Prisma
    return (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception &&
      // Дополнительная проверка, чтобы не ловить ошибки fs/системы
      (exception as any).code.toString().startsWith('P') 
    );
  }

  private mapPrismaError(exception: any): { status: number; message: string } {
    switch (exception.code) {
      case 'P2002':
        return {
          status: HttpStatus.CONFLICT,
          message: `Unique constraint failed on: ${exception.meta?.target}`,
        };
      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Record not found',
        };
      default:
        // Для остальных ошибок БД лучше возвращать 500 или 400 в зависимости от логики
        return {
          status: HttpStatus.BAD_REQUEST,
          message: `Database error: ${exception.code}`,
        };
    }
  }
}