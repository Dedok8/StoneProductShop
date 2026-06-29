import { Money } from '@shared/money/value-objects';

describe('Money', () => {
  describe('constructor', () => {
    it('creates a money value with a supported currency', () => {
      const money = new Money(100, 'UAH');

      expect(money.amount).toBe(100);
      expect(money.currency).toBe('UAH');
    });

    it('throws when amount is negative', () => {
      expect(() => new Money(-1, 'UAH')).toThrow(Error);
    });

    it('throws when currency is not supported', () => {
      expect(() => new Money(100, 'GBP' as never)).toThrow(Error);
    });
  });

  describe('add', () => {
    it('adds money values with the same currency', () => {
      const result = new Money(100, 'UAH').add(new Money(200, 'UAH'));

      expect(result).toEqual(new Money(300, 'UAH'));
    });

    it('throws when adding different currencies', () => {
      expect(() => new Money(100, 'UAH').add(new Money(100, 'USD'))).toThrow(
        Error,
      );
    });
  });

  describe('subtract', () => {
    it('subtracts money values with the same currency', () => {
      const result = new Money(300, 'USD').subtract(new Money(125, 'USD'));

      expect(result).toEqual(new Money(175, 'USD'));
    });

    it('throws when subtracting different currencies', () => {
      expect(() =>
        new Money(300, 'USD').subtract(new Money(125, 'EUR')),
      ).toThrow(Error);
    });

    it('throws when subtraction result would be negative', () => {
      expect(() =>
        new Money(100, 'EUR').subtract(new Money(125, 'EUR')),
      ).toThrow(Error);
    });
  });

  describe('multiply', () => {
    it('multiplies amount and rounds to two decimals', () => {
      const result = new Money(10, 'UAH').multiply(1.235);

      expect(result).toEqual(new Money(12.35, 'UAH'));
    });

    it('throws when factor is negative', () => {
      expect(() => new Money(10, 'UAH').multiply(-1)).toThrow(Error);
    });
  });

  describe('comparison', () => {
    it('checks whether money is greater than another value with the same currency', () => {
      expect(new Money(200, 'UAH').isGreaterThan(new Money(100, 'UAH'))).toBe(
        true,
      );
      expect(new Money(100, 'UAH').isGreaterThan(new Money(200, 'UAH'))).toBe(
        false,
      );
    });

    it('checks whether money is less than another value with the same currency', () => {
      expect(new Money(100, 'USD').isLessThan(new Money(200, 'USD'))).toBe(
        true,
      );
      expect(new Money(200, 'USD').isLessThan(new Money(100, 'USD'))).toBe(
        false,
      );
    });

    it('throws when comparing different currencies', () => {
      expect(() =>
        new Money(100, 'UAH').isGreaterThan(new Money(100, 'USD')),
      ).toThrow(Error);
      expect(() =>
        new Money(100, 'UAH').isLessThan(new Money(100, 'EUR')),
      ).toThrow(Error);
    });
  });

  describe('equals', () => {
    it('returns true for equal amount and currency', () => {
      expect(new Money(100, 'UAH').equals(new Money(100, 'UAH'))).toBe(true);
    });

    it('returns false for different amounts', () => {
      expect(new Money(100, 'UAH').equals(new Money(200, 'UAH'))).toBe(false);
    });

    it('returns false for different currencies', () => {
      expect(new Money(100, 'UAH').equals(new Money(100, 'USD'))).toBe(false);
    });
  });

  describe('toString', () => {
    it('formats amount with currency', () => {
      expect(new Money(149.99, 'EUR').toString()).toBe('149.99 EUR');
    });
  });
});
