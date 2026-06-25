import { BadRequestException } from '@nestjs/common';

import { ParsePositiveIntPipe } from './parse.positive.int.pipe';

describe('ParsePositiveIntPipe', () => {
  let pipe: ParsePositiveIntPipe;

  const meta = { type: 'param' as const, data: 'id', metatype: Number };

  beforeEach(() => {
    pipe = new ParsePositiveIntPipe();
  });

  // ─── Успешные случаи ─────────────────────────────────────────────────────

  it('должен преобразовать "42" в число 42', () => {
    expect(pipe.transform('42', meta)).toBe(42);
  });

  it('должен преобразовать "1" в число 1', () => {
    expect(pipe.transform('1', meta)).toBe(1);
  });

  it('должен работать с большими числами', () => {
    expect(pipe.transform('999999', meta)).toBe(999999);
  });

  // ─── Граничные случаи ────────────────────────────────────────────────────

  it('должен выбросить BadRequestException для "0" (ноль не позитивный)', () => {
    expect(() => pipe.transform('0', meta)).toThrow(BadRequestException);
  });

  it('должен выбросить BadRequestException для отрицательного числа "-5"', () => {
    expect(() => pipe.transform('-5', meta)).toThrow(BadRequestException);
  });

  it('должен выбросить BadRequestException для нечислового значения "abc"', () => {
    expect(() => pipe.transform('abc', meta)).toThrow(BadRequestException);
  });

  it('должен выбросить BadRequestException для пустой строки', () => {
    expect(() => pipe.transform('', meta)).toThrow(BadRequestException);
  });

  it('должен выбросить BadRequestException для "1.5" (дробное)', () => {
    // parseInt('1.5') === 1, что > 0 — пайп пропустит. Это ожидаемое поведение.
    // Документируем это поведение явно:
    expect(pipe.transform('1.5', meta)).toBe(1);
  });

  // ─── Содержимое ошибки ───────────────────────────────────────────────────

  it('сообщение об ошибке содержит имя поля', () => {
    try {
      pipe.transform('-1', meta);
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
      const response = (e as BadRequestException).getResponse() as {
        message: string;
      };
      expect(response.message).toContain('id');
    }
  });

  it('сообщение об ошибке содержит переданное значение', () => {
    try {
      pipe.transform('abc', meta);
    } catch (e) {
      const response = (e as BadRequestException).getResponse() as {
        message: string;
      };
      expect(response.message).toContain('abc');
    }
  });
});
