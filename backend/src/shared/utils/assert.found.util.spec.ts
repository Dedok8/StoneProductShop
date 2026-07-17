import { NotFoundException } from '@nestjs/common';

import { assertFound } from './assert-found.util';

describe('assertFound', () => {
  it('returns the entity unchanged if it is truthy', () => {
    const entity = { id: 'entity-1' };

    const result = assertFound(entity);

    expect(result).toBe(entity);
  });

  it('throws a NotFoundException with the default message if the entity is null', () => {
    expect(() => assertFound(null)).toThrow(NotFoundException);
    expect(() => assertFound(null)).toThrow('Entity not found');
  });

  it('throws a NotFoundException with the default message if the entity is undefined', () => {
    expect(() => assertFound(undefined)).toThrow(NotFoundException);
    expect(() => assertFound(undefined)).toThrow('Entity not found');
  });

  it('throws a NotFoundException with a custom message if provided', () => {
    expect(() => assertFound(null, 'Product not found')).toThrow(
      'Product not found',
    );
  });

  it('also throws for falsy-but-valid primitives like 0, "", or false (documents current !entity behavior)', () => {
    expect(() => assertFound(0)).toThrow(NotFoundException);
    expect(() => assertFound('')).toThrow(NotFoundException);
    expect(() => assertFound(false)).toThrow(NotFoundException);
  });
});
