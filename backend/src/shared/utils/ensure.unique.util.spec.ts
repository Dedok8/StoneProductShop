import { ConflictException } from '@nestjs/common';

import { ensureUnique } from './ensure-unique.util';

describe('ensureUnique', () => {
  it('resolves without throwing if the finder does not find anything', async () => {
    const finder = jest.fn().mockResolvedValue(null);

    await expect(ensureUnique(finder)).resolves.toBeUndefined();
  });

  it('throws a ConflictException with the default message if a conflicting record is found and no excludeId is provided', async () => {
    const finder = jest.fn().mockResolvedValue({ id: 'other-1' });

    await expect(ensureUnique(finder)).rejects.toThrow(ConflictException);
    await expect(ensureUnique(finder)).rejects.toThrow('Value already in use');
  });

  it('throws a ConflictException with a custom message when provided', async () => {
    const finder = jest.fn().mockResolvedValue({ id: 'other-1' });

    await expect(
      ensureUnique(finder, undefined, 'Slug already in use'),
    ).rejects.toThrow('Slug already in use');
  });

  it('does not throw if the found record has the same id as excludeId (updating your own record)', async () => {
    const finder = jest.fn().mockResolvedValue({ id: 'self-1' });

    await expect(ensureUnique(finder, 'self-1')).resolves.toBeUndefined();
  });

  it('throws a ConflictException if the found record has a different id than excludeId', async () => {
    const finder = jest.fn().mockResolvedValue({ id: 'other-1' });

    await expect(ensureUnique(finder, 'self-1')).rejects.toThrow(
      ConflictException,
    );
  });

  it('calls the finder exactly once', async () => {
    const finder = jest.fn().mockResolvedValue(null);

    await ensureUnique(finder);

    expect(finder).toHaveBeenCalledTimes(1);
  });
});
