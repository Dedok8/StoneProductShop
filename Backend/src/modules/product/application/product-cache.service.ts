import type { ProductEntity } from '@modules/product/domain';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';

interface ICachedList {
  items: ProductEntity[];
  total: number;
}

@Injectable()
export class ProductCacheService {
  private readonly DETAIL_TTL_MS = 5 * 60 * 1000;
  private readonly LIST_TTL_MS = 60 * 1000;

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  private detailKey(id: string): string {
    return `product:detail:${id}`;
  }

  private listKey(params: {
    typeId?: string;
    ownerId?: string;
    page: number;
    limit: number;
  }): string {
    return `product:list:${params.typeId ?? 'all'} : ${params.ownerId ?? 'all'} : ${params.page ?? 'all'} : ${params.limit ?? 'all'}`;
  }

  async getDetail(id: string): Promise<ProductEntity | undefined> {
    return this.cache.get<ProductEntity>(this.detailKey(id));
  }

  async setDetail(id: string, product: ProductEntity): Promise<void> {
    await this.cache.set(this.detailKey(id), product, this.DETAIL_TTL_MS);
  }

  async invalidateDetail(id: string): Promise<void> {
    await this.cache.del(this.detailKey(id));
  }

  async getList(params: {
    typeId?: string;
    ownerId?: string;
    page: number;
    limit: number;
  }): Promise<ICachedList | undefined> {
    return this.cache.get<ICachedList>(this.listKey(params));
  }

  async setList(
    params: { typeId?: string; ownerId?: string; page: number; limit: number },
    data: ICachedList,
  ): Promise<void> {
    await this.cache.set(this.listKey(params), data, this.LIST_TTL_MS);
  }
}
