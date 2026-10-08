import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ErrorCode, type ApiError } from '@stone-shop/shared';
import type { Request, Response } from 'express';
import { ZodValidationException } from 'nestjs-zod';
import { ZodError } from 'zod';

import { Prisma } from '@/generated/prisma/client';
import { AppError } from '@/shared/error';

const STATUS_BY_CODE: Record<ErrorCode, HttpStatus> = {
  NOT_FOUND: HttpStatus.NOT_FOUND,
  VALIDATION_FAILED: HttpStatus.BAD_REQUEST,
  UNAUTHORIZED: HttpStatus.UNAUTHORIZED,
  FORBIDDEN: HttpStatus.FORBIDDEN,
  ALREADY_EXISTS: HttpStatus.CONFLICT,
  CODE_EXPIRED: HttpStatus.GONE,
  TOO_MANY_ATTEMPTS: HttpStatus.TOO_MANY_REQUESTS,
  INSUFFICIENT_STOCK: HttpStatus.CONFLICT,
  INTERNAL_ERROR: HttpStatus.INTERNAL_SERVER_ERROR,
  UNKNOWN: HttpStatus.INTERNAL_SERVER_ERROR,
};

const CODE_BY_STATUS: Partial<Record<number, ErrorCode>> = {
  400: ErrorCode.VALIDATION_FAILED,
  401: ErrorCode.UNAUTHORIZED,
  403: ErrorCode.FORBIDDEN,
  404: ErrorCode.NOT_FOUND,
  409: ErrorCode.ALREADY_EXISTS,
  410: ErrorCode.CODE_EXPIRED,
  429: ErrorCode.TOO_MANY_ATTEMPTS,
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const error = this.toApiError(exception);

    if (error.statusCode >= 500) {
      this.logger.error(
        `Unhandled exception on ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} -> ${error.statusCode} ${error.code}`,
      );
    }

    response.status(error.statusCode).json({
      ...error,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private toApiError(exception: unknown): ApiError {
    if (exception instanceof AppError) {
      return {
        statusCode: STATUS_BY_CODE[exception.code],
        code: exception.code,
        message: exception.message,
      };
    }

    if (exception instanceof ZodValidationException) {
      const zodError = exception.getZodError() as ZodError;

      return {
        statusCode: HttpStatus.BAD_REQUEST,
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Validation failed',
        errors: zodError.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.fromPrisma(exception);
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const body = exception.getResponse();
      const raw =
        typeof body === 'string'
          ? body
          : (body as { message?: string | string[] }).message;

      return {
        statusCode,
        code: CODE_BY_STATUS[statusCode] ?? ErrorCode.UNKNOWN,
        message: Array.isArray(raw)
          ? raw.join('; ')
          : (raw ?? exception.message),
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: ErrorCode.INTERNAL_ERROR,
      message: 'Internal server error',
    };
  }

  private fromPrisma(e: Prisma.PrismaClientKnownRequestError): ApiError {
    switch (e.code) {
      case 'P2002': {
        const target = (e.meta?.target as string[] | undefined)?.join(', ');
        return {
          statusCode: HttpStatus.CONFLICT,
          code: ErrorCode.ALREADY_EXISTS,
          message: `Value already exists for field(s): ${target ?? 'unknown'}`,
        };
      }
      case 'P2025':
        return {
          statusCode: HttpStatus.NOT_FOUND,
          code: ErrorCode.NOT_FOUND,
          message: 'Record not found',
        };
      case 'P2003':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          code: ErrorCode.VALIDATION_FAILED,
          message: 'Invalid reference',
        };
      default:
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Database error',
        };
    }
  }
}
