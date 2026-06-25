export type Currency = 'UAH' | 'USD' | 'EUR';

const SUPPORTED_CURRENCIES: Currency[] = ['UAH', 'USD', 'EUR'];

export class Money {
  readonly amount: number;
  readonly currency: Currency;

  constructor(amount: number, currency: Currency) {
    if (amount < 0) {
      throw new Error(`Сумма не может быть отрицательной: ${amount}`);
    }

    if (!SUPPORTED_CURRENCIES.includes(currency)) {
      throw new Error(
        `Неподдерживаемая валюта: ${currency}. Поддерживаются: ${SUPPORTED_CURRENCIES.join(', ')}`,
      );
    }

    this.amount = amount;
    this.currency = currency;
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Нельзя складывать разные валюты');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Нельзя вычитать разные валюты');
    }
    if (this.amount < other.amount) {
      throw new Error('Результат вычитания не может быть отрицательным');
    }
    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(factor: number): Money {
    if (factor < 0) {
      throw new Error('Множитель не может быть отрицательным');
    }
    return new Money(
      Math.round(this.amount * factor * 100) / 100,
      this.currency,
    );
  }

  isGreaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amount > other.amount;
  }

  isLessThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amount < other.amount;
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  toString(): string {
    return `${this.amount} ${this.currency}`;
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(
        `Нельзя сравнивать разные валюты: ${this.currency} и ${other.currency}`,
      );
    }
  }
}
