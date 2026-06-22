import { PRODUCT_REPOSITORY } from '@modules/product/domain';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { ProductCacheService } from './product-cache.service';
import { ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;

  const repo = {
    findById: jest.fn(),
    findBySlug: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
  };

  const cache = {
    getDetail: jest.fn(),
    setDetail: jest.fn(),
    getList: jest.fn(),
    setList: jest.fn(),
    invalidateDetail: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: PRODUCT_REPOSITORY, useValue: repo },
        { provide: ProductCacheService, useValue: cache },
      ],
    }).compile();

    service = module.get(ProductService);
    jest.clearAllMocks();
  });

  it('findById - cache hit', async () => {
    cache.getDetail.mockResolvedValue({ id: '1' });

    const res = await service.findById('1');

    expect(res).toEqual({ id: '1' });
  });

  it('findById - not found', async () => {
    cache.getDetail.mockResolvedValue(null);
    repo.findById.mockResolvedValue(null);

    await expect(service.findById('1')).rejects.toThrow(NotFoundException);
  });

  it('delete - forbidden', async () => {
    repo.findById.mockResolvedValue({
      isOwnerById: () => false,
    });

    await expect(
      service.delete('1', { userId: 'x', role: 'USER' }),
    ).rejects.toThrow(ForbiddenException);
  });
});
