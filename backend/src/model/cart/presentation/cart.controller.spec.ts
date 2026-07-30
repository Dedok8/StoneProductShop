import { mock, type MockProxy } from 'jest-mock-extended';

import type { CartResponseDto, CartService } from '@/model/cart/application';
import { CartController } from '@/model/cart/presentation/cart.controller';

describe('cartController', () => {
  let controller: CartController;
  let service: MockProxy<CartService>;

  const mockCartResponse = { id: 'cart-1' } as CartResponseDto;

  beforeEach(() => {
    service = mock<CartService>();
    controller = new CartController(service);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getCart', () => {
    it('delegates to cartService.getCart with the current user id', async () => {
      service.getCart.mockResolvedValue(mockCartResponse);

      const result = await controller.getCart('user-1');

      expect(service.getCart).toHaveBeenCalledWith('user-1');
      expect(result).toBe(mockCartResponse);
    });
  });

  describe('addItem', () => {
    it('delegates to cartService.addItem with the user id and the dto fields', async () => {
      const dto = { productId: 'product-1', quantity: 2 };
      service.addItem.mockResolvedValue(mockCartResponse);

      const result = await controller.addItem('user-1', dto);

      expect(service.addItem).toHaveBeenCalledWith('user-1', 'product-1', 2);
      expect(result).toBe(mockCartResponse);
    });
  });

  describe('updateItem', () => {
    it('delegates to cartService.setItemQuantity with the user id, the productId param, and the dto quantity', async () => {
      const dto = { quantity: 5 };
      service.setItemQuantity.mockResolvedValue(mockCartResponse);

      const result = await controller.updateItem('user-1', 'product-1', dto);

      expect(service.setItemQuantity).toHaveBeenCalledWith(
        'user-1',
        'product-1',
        5,
      );
      expect(result).toBe(mockCartResponse);
    });
  });

  describe('removeItem', () => {
    it('delegates to cartService.removeItem with the user id and the productId param', async () => {
      service.removeItem.mockResolvedValue(mockCartResponse);

      const result = await controller.removeItem('user-1', 'product-1');

      expect(service.removeItem).toHaveBeenCalledWith('user-1', 'product-1');
      expect(result).toBe(mockCartResponse);
    });
  });

  describe('clear', () => {
    it('delegates to cartService.clear with the current user id', async () => {
      await controller.clear('user-1');

      expect(service.clear).toHaveBeenCalledWith('user-1');
    });
  });
});
