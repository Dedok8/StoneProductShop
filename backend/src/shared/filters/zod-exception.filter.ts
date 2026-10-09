import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { I18nContext } from 'nestjs-i18n';
import { ZodValidationException } from 'nestjs-zod';
import { ZodError } from 'zod';

@Catch(ZodValidationException)
export class ZodExceptionFilter implements ExceptionFilter {
  catch(exception: ZodValidationException, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const i18n = I18nContext.current(host);
    const zodError = exception.getZodError() as ZodError;

    const errors = zodError.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: i18n ? i18n.t(issue.message) : issue.message,
    }));

    res.status(400).json({ message: 'Validation failed', errors });
  }
}
