import {
  ICreateProductDto,
  IProductRepository,
  ProductEntity,
  IFindManyProductsParams,
  IUpdateProductDto,
} from '@modules/product/domain';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: ICreateProductDto): Promise<ProductEntity> {
    const created = await this.prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        price: data.price,
        stock: data.stock ?? 0,
        images: data.images ?? [],
        typeId: data.typeId,
        ownerId: data.ownerId,
      },
    });

    return this.toEntity(created);
  }

  async findById(id: string): Promise<ProductEntity | null> {
    const found = await this.prisma.product.findUnique({ where: { id } });
    return found ? this.toEntity(found) : null;
  }

  async findBySlug(slug: string): Promise<ProductEntity | null> {
    const found = await this.prisma.product.findUnique({ where: { slug } });
    return found ? this.toEntity(found) : null;
  }

  async findMany(
    params: IFindManyProductsParams,
  ): Promise<{ items: ProductEntity[]; total: number }> {
    const where = {
      ...(params.typeId && { typeId: params.typeId }),
      ...(params.ownerId && { ownerId: params.ownerId }),
      ...(params.isActive !== undefined && { isActive: params.isActive }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items: items.map((item) => this.toEntity(item)), total };
  }

  async update(id: string, data: IUpdateProductDto): Promise<ProductEntity> {
    const updated = await this.prisma.product.update({
      where: { id },
      data,
    });

    return this.toEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({ where: { id } });
  }

  async decrementStock(id: string, quantity: number): Promise<ProductEntity> {
    const updated = await this.prisma.product.update({
      where: { id, stock: { gte: quantity } },
      data: { stock: { decrement: quantity } },
    });

    return this.toEntity(updated);
  }

  private toEntity(raw: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: { toNumber(): number } | number;
    stock: number;
    images: string[];
    typeId: string;
    ownerId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): ProductEntity {
    return new ProductEntity({
      ...raw,
      price: typeof raw.price === 'number' ? raw.price : raw.price.toNumber(),
    });
  }
}
