import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

import { AppError } from '@/shared/error';

@Injectable()
export class ParsePositiveIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const parsed = parseInt(value, 10);

    if (isNaN(parsed) || parsed <= 0) {
      throw AppError.validationFail(
        `${metadata.data ?? 'Value'} must be a positive integer, got: "${value}"`,
      );
    }

    return parsed;
  }
}
