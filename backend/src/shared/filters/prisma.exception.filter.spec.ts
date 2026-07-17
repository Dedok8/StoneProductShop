import type { ArgumentsHost } from '@nestjs/common';
import { HttpStatus, Logger } from '@nestjs/common';

import { PrismaExceptionFilter } from './prisma-exception.filter';

import type { Prisma } from '@/generated/prisma/client';

interface ErrorResponseBody {
  statusCode: number;
  message: string;
  path: string;
  timestamp: string;
}

const makePrismaError = (
  code: string,
  overrides: Partial<Prisma.PrismaClientKnownRequestError> = {},
): Prisma.PrismaClientKnownRequestError =>
  ({
    code,
    message: `Prisma error ${code}`,
    clientVersion: '6.0.0',
    meta: undefined,
    name: 'PrismaClientKnownRequestError',
    ...overrides,
  }) as unknown as Prisma.PrismaClientKnownRequestError;

describe('prismaExceptionFilter', () => {
  let filter: PrismaExceptionFilter;

  const buildHost = (method = 'POST', url = '/products') => {
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn((_body: ErrorResponseBody) => undefined),
    };
    const request = { method, url };
    const host = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => request,
      }),
    } as unknown as ArgumentsHost;

    return { host, response, request };
  };

  beforeEach(() => {
    filter = new PrismaExceptionFilter();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('maps P2002 to 409 Conflict and names the conflicting field(s)', () => {
    const { host, response } = buildHost();
    const exception = makePrismaError('P2002', {
      meta: { target: ['slug'] },
    });

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.CONFLICT,
        message: 'Value already exists for field(s): slug',
      }),
    );
  });

  it('joins multiple target fields for P2002', () => {
    const { host, response } = buildHost();
    const exception = makePrismaError('P2002', {
      meta: { target: ['name', 'slug'] },
    });

    filter.catch(exception, host);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Value already exists for field(s): name, slug',
      }),
    );
  });

  it('falls back to "unknown" for P2002 if no target metadata is present', () => {
    const { host, response } = buildHost();
    const exception = makePrismaError('P2002', { meta: undefined });

    filter.catch(exception, host);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Value already exists for field(s): unknown',
      }),
    );
  });

  it('maps P2025 to 404 Not Found', () => {
    const { host, response } = buildHost();
    const exception = makePrismaError('P2025');

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Record not found',
      }),
    );
  });

  it('maps P2003 to 400 Bad Request and names the invalid field', () => {
    const { host, response } = buildHost();
    const exception = makePrismaError('P2003', {
      meta: { field_name: 'categoryId' },
    });

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid reference: categoryId',
      }),
    );
  });

  it('falls back to a generic message for P2003 if field_name is missing or not a string', () => {
    const { host, response } = buildHost();
    const exception = makePrismaError('P2003', { meta: undefined });

    filter.catch(exception, host);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid reference: related record does not exist',
      }),
    );
  });

  it('maps any other Prisma error code to a generic 500 database error', () => {
    const { host, response } = buildHost();
    const exception = makePrismaError('P9999');

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Database error',
      }),
    );
  });

  it('includes the request path and a valid ISO timestamp in the response body', () => {
    const { host, response } = buildHost('DELETE', '/products/prod-1');
    const exception = makePrismaError('P2025');

    filter.catch(exception, host);

    const [body] = response.json.mock.calls[0];
    expect(body.path).toBe('/products/prod-1');
    expect(new Date(body.timestamp).toString()).not.toBe('Invalid Date');
  });

  it('logs a warning with the Prisma error code, method, url, and original message', () => {
    const { host } = buildHost('POST', '/products');
    const exception = makePrismaError('P2002', {
      message: 'Unique constraint failed on the fields: (`slug`)',
    });
    const warnSpy = jest.spyOn(Logger.prototype, 'warn');

    filter.catch(exception, host);

    expect(warnSpy).toHaveBeenCalledWith(
      'Prisma error P2002 on POST /products: Unique constraint failed on the fields: (`slug`)',
    );
  });
});
