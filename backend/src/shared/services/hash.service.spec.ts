import { HashService } from '@/shared/services/hash.service';

describe('HashService', () => {
  let service: HashService;

  beforeEach(() => {
    service = new HashService();
  });

  it('produces a hash that is different from the original plain text', async () => {
    const hash = await service.hash('!Password123');

    expect(hash).not.toBe('!Password123');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('produces different hashes for the same input due to salting', async () => {
    const [hashA, hashB] = await Promise.all([
      service.hash('!Password123'),
      service.hash('!Password123'),
    ]);

    expect(hashA).not.toBe(hashB);
  });

  it('resolves compare to true for the correct plain/hash pair', async () => {
    const hash = await service.hash('!Password123');

    await expect(service.compare('!Password123', hash)).resolves.toBe(true);
  });

  it('resolves compare to false for an incorrect plain text', async () => {
    const hash = await service.hash('!Password123');

    await expect(service.compare('!WrongPassword', hash)).resolves.toBe(false);
  });

  it('resolves compare to false against a malformed or foreign hash', async () => {
    await expect(
      service.compare('!Password123', 'not-a-real-hash'),
    ).resolves.toBe(false);
  });

  it('hashes and compares an empty string without throwing', async () => {
    const hash = await service.hash('');

    await expect(service.compare('', hash)).resolves.toBe(true);
  });
});
