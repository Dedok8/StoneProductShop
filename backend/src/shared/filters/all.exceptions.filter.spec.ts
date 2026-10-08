// import type { ArgumentsHost } from '@nestjs/common';
// import {
//   BadRequestException,
//   ImATeapotException,
//   Logger,
// } from '@nestjs/common';
// import { ForbiddenException, GoneException } from '@nestjs/common';
// import { ErrorCode } from '@stone-shop/shared';
// import { ZodValidationException } from 'nestjs-zod';
// import { z } from 'zod';

// import { Prisma } from '@/generated/prisma/client';
// import { AppError } from '@/shared/error';
// import { AllExceptionsFilter } from '@/shared/filters/all.exceptions.filter';

// function createHost() {
//   const json = jest.fn();
//   const status = jest.fn().mockReturnValue({ json });
//   const host = {
//     switchToHttp: () => ({
//       getResponse: () => ({ status }),
//       getRequest: () => ({ method: 'GET', url: '/test' }),
//     }),
//   } as unknown as ArgumentsHost;
//   return { host, status, json };
// }

// describe('AllExceptionsFilter', () => {
//   const filter = new AllExceptionsFilter();

//   it('maps AppError to its code and status', () => {
//     const { host, status, json } = createHost();
//     filter.catch(new AppError(ErrorCode.CODE_EXPIRED, 'expired'), host);

//     expect(status).toHaveBeenCalledWith(410);
//     expect(json).toHaveBeenCalledWith(
//       expect.objectContaining({
//         code: 'CODE_EXPIRED',
//         message: 'expired',
//         path: '/test',
//       }),
//     );
//   });

//   it('maps HttpException by status', () => {
//     const { host, status, json } = createHost();
//     filter.catch(new ForbiddenException('nope'), host);

//     expect(status).toHaveBeenCalledWith(403);
//     expect(json).toHaveBeenCalledWith(
//       expect.objectContaining({ code: 'FORBIDDEN' }),
//     );
//   });

//   it('maps GoneException to CODE_EXPIRED', () => {
//     const { host, json } = createHost();
//     filter.catch(new GoneException(), host);
//     expect(json).toHaveBeenCalledWith(
//       expect.objectContaining({ code: 'CODE_EXPIRED' }),
//     );
//   });

//   it('hides details of unknown errors', () => {
//     const { host, status, json } = createHost();
//     filter.catch(new Error('secret db password'), host);

//     expect(status).toHaveBeenCalledWith(500);
//     const body = json.mock.calls[0][0];
//     expect(body.code).toBe('INTERNAL_ERROR');
//     expect(body.message).toBe('Internal server error');
//     expect(JSON.stringify(body)).not.toContain('secret');
//   });

//   beforeAll(() => {
//     jest.spyOn(Logger.prototype, 'error').mockImplementation();
//     jest.spyOn(Logger.prototype, 'warn').mockImplementation();
//   });
//   afterAll(() => jest.restoreAllMocks());

//   describe('AppError -> status for every ErrorCode', () => {
//     it.each([
//       [ErrorCode.NOT_FOUND, 404],
//       [ErrorCode.VALIDATION_FAILED, 400],
//       [ErrorCode.UNAUTHORIZED, 401],
//       [ErrorCode.FORBIDDEN, 403],
//       [ErrorCode.ALREADY_EXISTS, 409],
//       [ErrorCode.CODE_EXPIRED, 410],
//       [ErrorCode.TOO_MANY_ATTEMPTS, 429],
//       [ErrorCode.INTERNAL_ERROR, 500],
//       [ErrorCode.UNKNOWN, 500],
//     ])('%s -> %i', (code, expectedStatus) => {
//       const { host, status, json } = createHost();
//       filter.catch(new AppError(code, 'msg'), host);

//       expect(status).toHaveBeenCalledWith(expectedStatus);
//       expect(json).toHaveBeenCalledWith(expect.objectContaining({ code }));
//     });
//   });

//   describe('ZodValidationException', () => {
//     const schema = z.object({
//       name: z.string().min(1),
//       nested: z.object({ age: z.number() }),
//     });

//     it('returns 400 VALIDATION_FAILED with errors[] and dotted paths', () => {
//       const result = schema.safeParse({ name: '', nested: { age: 'x' } });
//       if (result.success) throw new Error('schema should fail');

//       const { host, status, json } = createHost();
//       filter.catch(new ZodValidationException(result.error), host);

//       expect(status).toHaveBeenCalledWith(400);
//       const body = json.mock.calls[0][0];
//       expect(body.code).toBe('VALIDATION_FAILED');
//       expect(body.message).toBe('Validation failed');
//       expect(body.errors).toEqual(
//         expect.arrayContaining([
//           expect.objectContaining({ path: 'name' }),
//           expect.objectContaining({ path: 'nested.age' }),
//         ]),
//       );
//     });
//   });

//   describe('PrismaClientKnownRequestError', () => {
//     const prismaError = (code: string, meta?: Record<string, unknown>) =>
//       new Prisma.PrismaClientKnownRequestError('db error', {
//         code,
//         clientVersion: 'test',
//         meta,
//       });

//     it('P2002 -> 409 ALREADY_EXISTS with field names', () => {
//       const { host, status, json } = createHost();
//       filter.catch(prismaError('P2002', { target: ['slug', 'sku'] }), host);

//       expect(status).toHaveBeenCalledWith(409);
//       const body = json.mock.calls[0][0];
//       expect(body.code).toBe('ALREADY_EXISTS');
//       expect(body.message).toContain('slug, sku');
//     });

//     it('P2002 without meta -> falls back to "unknown"', () => {
//       const { host, json } = createHost();
//       filter.catch(prismaError('P2002'), host);
//       expect(json.mock.calls[0][0].message).toContain('unknown');
//     });

//     it('P2025 -> 404 NOT_FOUND', () => {
//       const { host, status, json } = createHost();
//       filter.catch(prismaError('P2025'), host);

//       expect(status).toHaveBeenCalledWith(404);
//       expect(json).toHaveBeenCalledWith(
//         expect.objectContaining({
//           code: 'NOT_FOUND',
//           message: 'Record not found',
//         }),
//       );
//     });

//     it('P2003 -> 400 VALIDATION_FAILED without leaking field names', () => {
//       const { host, status, json } = createHost();
//       filter.catch(
//         prismaError('P2003', { field_name: 'product_category_fkey' }),
//         host,
//       );

//       expect(status).toHaveBeenCalledWith(400);
//       const body = json.mock.calls[0][0];
//       expect(body.code).toBe('VALIDATION_FAILED');
//       expect(JSON.stringify(body)).not.toContain('product_category_fkey');
//     });

//     it('unknown prisma code -> 500 INTERNAL_ERROR "Database error"', () => {
//       const { host, status, json } = createHost();
//       filter.catch(prismaError('P9999'), host);

//       expect(status).toHaveBeenCalledWith(500);
//       expect(json).toHaveBeenCalledWith(
//         expect.objectContaining({
//           code: 'INTERNAL_ERROR',
//           message: 'Database error',
//         }),
//       );
//     });
//   });

//   describe('HttpException edge cases', () => {
//     it('joins array messages with "; "', () => {
//       const { host, json } = createHost();
//       filter.catch(new BadRequestException(['a is bad', 'b is bad']), host);
//       expect(json.mock.calls[0][0].message).toBe('a is bad; b is bad');
//     });

//     it('unmapped status -> code UNKNOWN, status preserved', () => {
//       const { host, status, json } = createHost();
//       filter.catch(new ImATeapotException(), host);

//       expect(status).toHaveBeenCalledWith(418);
//       expect(json).toHaveBeenCalledWith(
//         expect.objectContaining({ code: 'UNKNOWN' }),
//       );
//     });
//   });
// });
