import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { Prisma } from '@/generated/prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, message } = this.mapErrorCode(exception);

    this.logger.warn(
      `Prisma error ${exception.code} on ${request.method} ${request.url}: ${exception.message}`,
    );

    response.status(statusCode).json({
      statusCode,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private mapErrorCode(exception: Prisma.PrismaClientKnownRequestError): {
    statusCode: number;
    message: string;
  } {
    switch (exception.code) {
      case 'P2002': {
        const target = (exception.meta?.target as string[] | undefined)?.join(
          ', ',
        );
        return {
          statusCode: HttpStatus.CONFLICT,
          message: `Value already exists for field(s): ${target ?? 'unknown'}`,
        };
      }
      case 'P2025':
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Record not found',
        };
      case 'P2003': {
        const field =
          typeof exception.meta?.field_name === 'string'
            ? exception.meta.field_name
            : 'related record does not exist';

        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Invalid reference: ${field}`,
        };
      }
      default:
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database error',
        };
    }
  }
}
