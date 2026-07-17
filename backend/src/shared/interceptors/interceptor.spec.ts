import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { HttpStatus, Logger } from '@nestjs/common';
import { of } from 'rxjs';

import { LoggingInterceptor } from '@/shared/interceptors/logging.interceptor';
import { TransformInterceptor } from '@/shared/interceptors/transform.interceptor';

describe('loggingInterceptor', () => {
  let interceptor: LoggingInterceptor;

  const buildContext = (method: string, url: string): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ method, url }),
      }),
    }) as unknown as ExecutionContext;

  const buildCallHandler = (): CallHandler => ({
    handle: () => of({ ok: true }),
  });

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('passes the response through unchanged', (done) => {
    interceptor
      .intercept(buildContext('GET', '/order'), buildCallHandler())
      .subscribe((result) => {
        expect(result).toEqual({ ok: true });
        done();
      });
  });

  it('logs method, url and a duration after the handler completes', (done) => {
    const logSpy = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => undefined);

    interceptor
      .intercept(buildContext('POST', '/order'), buildCallHandler())
      .subscribe(() => {
        expect(logSpy).toHaveBeenCalledTimes(1);
        expect(logSpy.mock.calls[0][0]).toEqual(
          expect.stringMatching(/^POST \/order — \d+ms$/),
        );
        logSpy.mockRestore();
        done();
      });
  });
});

describe('transformInterceptor', () => {
  let interceptor: TransformInterceptor<unknown>;

  const buildContext = (statusCode: number): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getResponse: () => ({ statusCode }),
      }),
    }) as unknown as ExecutionContext;

  const buildCallHandler = (payload: unknown): CallHandler => ({
    handle: () => of(payload),
  });

  beforeEach(() => {
    interceptor = new TransformInterceptor();
  });

  it('wraps a normal response in { data, timestamp }', (done) => {
    interceptor
      .intercept(buildContext(HttpStatus.OK), buildCallHandler({ id: 1 }))
      .subscribe((result) => {
        expect(result).toEqual({
          data: { id: 1 },
          timestamp: expect.any(String) as string,
        });
        // sanity check it's a real ISO timestamp
        expect(new Date(result!.timestamp).toString()).not.toBe('Invalid Date');
        done();
      });
  });

  it('returns undefined (no body) for a 204 No Content response', (done) => {
    interceptor
      .intercept(buildContext(HttpStatus.NO_CONTENT), buildCallHandler(null))
      .subscribe((result) => {
        expect(result).toBeUndefined();
        done();
      });
  });

  it('still wraps falsy-but-present data like 0 or empty array', (done) => {
    interceptor
      .intercept(buildContext(HttpStatus.OK), buildCallHandler([]))
      .subscribe((result) => {
        expect(result).toEqual({
          data: [],
          timestamp: expect.any(String) as string,
        });
        done();
      });
  });
});
