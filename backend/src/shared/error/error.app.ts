import { ErrorCode } from '@stone-shop/shared';

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static notFound(message = 'Not found') {
    return new AppError(ErrorCode.NOT_FOUND, message);
  }

  static alreadyExists(message = 'Already exists') {
    return new AppError(ErrorCode.ALREADY_EXISTS, message);
  }

  static forbidden(message = 'Forbidden') {
    return new AppError(ErrorCode.FORBIDDEN, message);
  }

  static unauthorized(message = 'unauthorized') {
    return new AppError(ErrorCode.UNAUTHORIZED, message);
  }

  static validationFail(message = 'validation fail') {
    return new AppError(ErrorCode.VALIDATION_FAILED, message);
  }
}

export class ProductNotFoundError extends AppError {
  constructor(productId: string) {
    super(ErrorCode.NOT_FOUND, `Product ${productId} not found`);
    this.name = 'ProductNotFoundError';
  }
}

export class InsufficientStockError extends AppError {
  constructor(
    public readonly productId: string,
    public readonly available: number,
    public readonly requested: number,
  ) {
    super(
      ErrorCode.INSUFFICIENT_STOCK,
      `Insufficient stock for product ${productId}: available ${available}, requested ${requested}`,
    );
    this.name = 'InsufficientStockError';
  }
}
