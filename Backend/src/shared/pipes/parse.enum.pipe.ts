import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ParseEnumPipe<T extends object> implements PipeTransform {
  constructor(private readonly enumType: T) {}

  transform(value: string, metadata: ArgumentMetadata): T[keyof T] {
    const enumValues = Object.values(this.enumType) as string[];

    if (!enumValues.includes(value)) {
      throw new BadRequestException(
        `${metadata.data ?? 'Value'} must be one of: ${enumValues.join(', ')}. Got: "${value}"`,
      );
    }

    return value as unknown as T[keyof T];
  }
}
