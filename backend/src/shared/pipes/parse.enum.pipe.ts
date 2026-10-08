import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

import { AppError } from '@/shared/error';

@Injectable()
export class ParseEnumPipe<T extends object> implements PipeTransform {
  constructor(private readonly enumType: T) {}

  transform(value: string, metadata: ArgumentMetadata): T[keyof T] {
    const enumValues = Object.values(this.enumType) as string[];

    if (!enumValues.includes(value)) {
      throw AppError.validationFail(
        `${metadata.data ?? 'Value'} must be one of: ${enumValues.join(', ')}. Got: "${value}"`,
      );
    }

    return value as unknown as T[keyof T];
  }
}
