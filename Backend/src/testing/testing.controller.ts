import { Controller, ForbiddenException, Post } from '@nestjs/common';
import { PrismaService } from '@shared/prisma';

@Controller('testing')
export class TestingController {
  constructor(private prisma: PrismaService) {}

  @Post('reset')
  async reset() {
    if (process.env.NODE_ENV !== 'test') {
      throw new ForbiddenException(
        'This endpoint is only available in test environment',
      );
    }

    await this.prisma.$transaction([
      this.prisma.orderItem.deleteMany(),
      this.prisma.order.deleteMany(),
      this.prisma.product.deleteMany(),
      this.prisma.category.deleteMany(),
      this.prisma.user.deleteMany(),
    ]);

    return { ok: true };
  }
}
