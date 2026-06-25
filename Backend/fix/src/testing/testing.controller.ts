import { Controller, ForbiddenException, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@shared/guards';
import { PrismaService } from '@shared/prisma';

@Controller('testing')
@UseGuards(JwtAuthGuard)
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
