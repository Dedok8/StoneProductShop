import type { ArgumentsHost } from '@nestjs/common';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';

import { HttpExceptionFilter } from './http-exception.filter';

interface ErrorResponseBody {
  statusCode: number;
  message: string | string[];
  path: string;
  timestamp: string;
}

describe('httpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  const buildHost = (method = 'GET', url = '/categories') => {
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
    filter = new HttpExceptionFilter();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('uses the status and message from a string response', () => {
    const { host, response } = buildHost();
    const exception = new HttpException(
      'Category not found',
      HttpStatus.NOT_FOUND,
    );

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Category not found',
      }),
    );
  });

  it('uses the message from an object response body', () => {
    const { host, response } = buildHost();
    const exception = new HttpException(
      { message: 'Slug already in use' },
      HttpStatus.CONFLICT,
    );

    filter.catch(exception, host);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Slug already in use' }),
    );
  });

  it('preserves an array of messages from a validation-style response body', () => {
    const { host, response } = buildHost();
    const exception = new HttpException(
      { message: ['name must not be empty', 'slug must not be empty'] },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, host);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: ['name must not be empty', 'slug must not be empty'],
      }),
    );
  });

  it('falls back to exception.message if the object response body has no message field', () => {
    const { host, response } = buildHost();
    const exception = new HttpException(
      { error: 'Forbidden' },
      HttpStatus.FORBIDDEN,
    );

    filter.catch(exception, host);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: exception.message }),
    );
  });

  it('includes the request path and a valid ISO timestamp in the response body', () => {
    const { host, response } = buildHost('PATCH', '/categories/category-1');
    const exception = new HttpException('Nope', HttpStatus.BAD_REQUEST);

    filter.catch(exception, host);

    const [body] = response.json.mock.calls[0];
    expect(body.path).toBe('/categories/category-1');
    expect(new Date(body.timestamp).toString()).not.toBe('Invalid Date');
  });

  it('logs a warning with the method, url, status, and message', () => {
    const { host } = buildHost('POST', '/categories');
    const exception = new HttpException('Slug taken', HttpStatus.CONFLICT);
    const warnSpy = jest.spyOn(Logger.prototype, 'warn');

    filter.catch(exception, host);

    expect(warnSpy).toHaveBeenCalledWith(
      `POST /categories — ${HttpStatus.CONFLICT}: Slug taken`,
    );
  });

  it('joins array messages with "; " in the log line', () => {
    const { host } = buildHost('POST', '/categories');
    const exception = new HttpException(
      { message: ['name required', 'slug required'] },
      HttpStatus.BAD_REQUEST,
    );
    const warnSpy = jest.spyOn(Logger.prototype, 'warn');

    filter.catch(exception, host);

    expect(warnSpy).toHaveBeenCalledWith(
      `POST /categories — ${HttpStatus.BAD_REQUEST}: name required; slug required`,
    );
  });
});
