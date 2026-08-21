import type { InspirationImage } from '@/generated/prisma';
import type {
  ICreateInspirationImageData,
  IInspirationImageRepository,
  IUpdateInspirationImageData,
} from '@/model/inspiration/domain';
import { InspirationImageEntity } from '@/model/inspiration/domain';
import {
  createAndInvalidate,
  deleteAndInvalidate,
  findManyCached,
  findOneCached,
  updateAndInvalidate,
  type PrismaService,
  type RedisCacheService,
} from '@/shared';

const LIST_TTL_SEC = 60;
const DETAIL_TTL_SEC = 5 * 60;
const idKey = (id: string) => `inspiration:id:${id}`;
const listPattern = 'inspiration:list*';

export class InspirationImageRepository implements IInspirationImageRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: RedisCacheService,
  ) {}
  async findAllOrdered(): Promise<InspirationImageEntity[]> {
    const { items } = await findManyCached<
      InspirationImage,
      InspirationImage,
      InspirationImageEntity
    >({
      cache: this.cache,
      key: listPattern,
      ttl: LIST_TTL_SEC,
      entityClass: InspirationImageEntity,
      fetch: async () => {
        const items = await this.prisma.inspirationImage.findMany({
          orderBy: { createdAt: 'asc' },
        });

        return { items, total: items.length };
      },
    });

    return items;
  }
  async findById(id: string): Promise<InspirationImageEntity | null> {
    return findOneCached<
      InspirationImage,
      InspirationImage,
      InspirationImageEntity
    >({
      cache: this.cache,
      key: idKey(id),
      ttl: DETAIL_TTL_SEC,
      fetch: () => this.prisma.inspirationImage.findUnique({ where: { id } }),
      entityClass: InspirationImageEntity,
    });
  }
  async create(
    data: ICreateInspirationImageData,
  ): Promise<InspirationImageEntity> {
    return createAndInvalidate({
      createFn: () =>
        this.prisma.inspirationImage.create({
          data: {
            imageUrl: data.imageUrl,
            alt: data.alt,
          },
        }),
      cache: this.cache,
      invalidateKeys: (inspiration) => [idKey(inspiration.id), listPattern],
      entityClass: InspirationImageEntity,
    });
  }
  async update(
    id: string,
    data: IUpdateInspirationImageData,
  ): Promise<InspirationImageEntity | null> {
    return updateAndInvalidate({
      updateFn: () =>
        this.prisma.inspirationImage.update({ where: { id }, data }),
      cache: this.cache,
      invalidateKeys: (inspiration) => [idKey(inspiration.id), listPattern],
      entityClass: InspirationImageEntity,
    });
  }

  async delete(id: string): Promise<void> {
    return deleteAndInvalidate({
      deleteFn: () => this.prisma.inspirationImage.delete({ where: { id } }),
      cache: this.cache,
      invalidateKeys: (inspiration) => [idKey(inspiration.id), listPattern],
    });
  }
}
