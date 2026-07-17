import type { ArgumentsHost } from '@nestjs/common';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';

import { AllExceptionsFilter } from './all.exceptions.filter';

interface ErrorResponseBody {
  statusCode: number;
  message: string | string[];
  path: string;
  timestamp: string;
}

describe('allExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

  const buildHost = (method = 'GET', url = '/products') => {
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
    filter = new AllExceptionsFilter();
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('uses the status and string message from an HttpException with a string response', () => {
    const { host, response } = buildHost();
    const exception = new HttpException('Not allowed', HttpStatus.FORBIDDEN);

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Not allowed',
        path: '/products',
      }),
    );
  });

  it('uses the message array from an HttpException with an object response', () => {
    const { host, response } = buildHost();
    const exception = new HttpException(
      { message: ['name must not be empty'] },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, host);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: ['name must not be empty'],
      }),
    );
  });

  it('falls back to "Internal server error" if the HttpException response object has no message field', () => {
    const { host, response } = buildHost();
    const exception = new HttpException({ error: 'Oops' }, HttpStatus.CONFLICT);

    filter.catch(exception, host);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Internal server error' }),
    );
  });

  it('returns a 500 with a generic message for a non-HttpException error', () => {
    const { host, response } = buildHost();

    filter.catch(new Error('Something exploded'), host);

    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      }),
    );
  });

  it('returns a 500 for a thrown value that is not an Error instance', () => {
    const { host, response } = buildHost();

    filter.catch('just a string', host);

    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  });

  it('includes the request path and a valid ISO timestamp in the response body', () => {
    const { host, response } = buildHost('POST', '/orders/order-1');

    filter.catch(new HttpException('Nope', HttpStatus.BAD_REQUEST), host);

    const [body] = response.json.mock.calls[0];
    expect(body.path).toBe('/orders/order-1');
    expect(new Date(body.timestamp).toString()).not.toBe('Invalid Date');
  });

  it('logs the error with the request method and url', () => {
    const { host } = buildHost('DELETE', '/products/prod-1');
    // Re-grabbing the spy here (instead of reusing a bare `jest.SpyInstance`-typed
    // outer variable) lets TypeScript infer its real signature from
    // `Logger.prototype.error`, so `.mock.calls` is concretely typed.
    const errorSpy = jest.spyOn(Logger.prototype, 'error');

    filter.catch(new Error('boom'), host);

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy.mock.calls[0][0]).toBe(
      'Unhandled exception on DELETE /products/prod-1',
    );
  });

  it('logs the stack trace for Error instances and the stringified value otherwise', () => {
    const { host } = buildHost();
    const errorSpy = jest.spyOn(Logger.prototype, 'error');
    const error = new Error('boom');

    filter.catch(error, host);
    expect(errorSpy.mock.calls[0][1]).toBe(error.stack);

    filter.catch('raw string failure', host);
    expect(errorSpy.mock.calls[1][1]).toBe('raw string failure');
  });
});
