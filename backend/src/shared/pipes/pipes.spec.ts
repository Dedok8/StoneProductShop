import type { ArgumentMetadata } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';

import { ParseEnumPipe } from '@/shared/pipes/parse.enum.pipe';
import { ParsePositiveIntPipe } from '@/shared/pipes/parse.positive.int.pipe';

enum SampleStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

const metadata: ArgumentMetadata = {
  type: 'param',
  data: 'status',
};

describe('parseEnumPipe', () => {
  let pipe: ParseEnumPipe<typeof SampleStatus>;

  beforeEach(() => {
    pipe = new ParseEnumPipe(SampleStatus);
  });

  it('returns the value unchanged when it is a valid enum member', () => {
    expect(pipe.transform('ACTIVE', metadata)).toBe('ACTIVE');
  });

  it('throws BadRequestException for a value not in the enum', () => {
    expect(() => pipe.transform('DELETED', metadata)).toThrow(
      BadRequestException,
    );
  });

  it('includes the field name and allowed values in the error message', () => {
    try {
      pipe.transform('DELETED', metadata);
      fail('expected transform to throw');
    } catch (err) {
      expect(err).toBeInstanceOf(BadRequestException);
      expect((err as BadRequestException).message).toContain('status');
      expect((err as BadRequestException).message).toContain('ACTIVE');
      expect((err as BadRequestException).message).toContain('ARCHIVED');
    }
  });

  it('falls back to "Value" in the message when metadata.data is undefined', () => {
    try {
      pipe.transform('DELETED', { type: 'param' });
      fail('expected transform to throw');
    } catch (err) {
      expect((err as BadRequestException).message).toContain('Value must be');
    }
  });

  it('is case-sensitive (does not silently accept "active")', () => {
    expect(() => pipe.transform('active', metadata)).toThrow(
      BadRequestException,
    );
  });
});

describe('parsePositiveIntPipe', () => {
  let pipe: ParsePositiveIntPipe;

  beforeEach(() => {
    pipe = new ParsePositiveIntPipe();
  });

  it('parses a valid positive integer string', () => {
    expect(pipe.transform('5', metadata)).toBe(5);
  });

  it('throws for zero', () => {
    expect(() => pipe.transform('0', metadata)).toThrow(BadRequestException);
  });

  it('throws for a negative number', () => {
    expect(() => pipe.transform('-3', metadata)).toThrow(BadRequestException);
  });

  it('throws for a non-numeric string', () => {
    expect(() => pipe.transform('abc', metadata)).toThrow(BadRequestException);
  });

  it('truncates a float-like string via parseInt (documents current behavior)', () => {
    expect(pipe.transform('2.9', metadata)).toBe(2);
  });

  it('throws for an empty string', () => {
    expect(() => pipe.transform('', metadata)).toThrow(BadRequestException);
  });
});
