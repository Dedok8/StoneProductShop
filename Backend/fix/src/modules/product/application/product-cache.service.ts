import type { ProductEntity } from '@modules/product/domain';
import { Injectable } from '@nestjs/common';
import { RedisCacheService } from '@shared/redis';

interface ICachedList {
  items: ProductEntity[];
  total: number;
}

@Injectable()
export class ProductCacheService {
  private readonly DETAIL_TTL_SEC = 5 * 60;
  private readonly LIST_TTL_SEC = 60;

  constructor(private readonly cache: RedisCacheService) {}

  private detailKey(id: string): string {
    return `product:detail:${id}`;
  }

  private listKey(params: {
    categoryId?: string;
    ownerId?: string;
    page: number;
    limit: number;
  }): string {
    return `product:list:${params.categoryId ?? 'all'}:${params.ownerId ?? 'all'}:${params.page}:${params.limit}`;
  }

  async getDetail(id: string): Promise<ProductEntity | null> {
    return this.cache.getJson<ProductEntity>(this.detailKey(id));
  }

  async setDetail(id: string, product: ProductEntity): Promise<void> {
    await this.cache.setJson(this.detailKey(id), product, this.DETAIL_TTL_SEC);
  }

  async invalidateDetail(id: string): Promise<void> {
    // Use O(1) delete for the exact key, not SCAN
    await this.cache.delete(this.detailKey(id));

    // Invalidate all list pages since product data changed
    await this.cache.deleteByPattern('product:list:*');
  }

  async getList(params: {
    categoryId?: string;
    ownerId?: string;
    page: number;
    limit: number;
  }): Promise<ICachedList | null> {
    return this.cache.getJson<ICachedList>(this.listKey(params));
  }

  async setList(
    params: {
      categoryId?: string;
      ownerId?: string;
      page: number;
      limit: number;
    },
    data: ICachedList,
  ): Promise<void> {
    await this.cache.setJson(this.listKey(params), data, this.LIST_TTL_SEC);
  }
}
