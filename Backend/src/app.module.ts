import { AuthModule } from '@modules/auth';
import { CategoryModule } from '@modules/category/category.module';
import { OrderModule } from '@modules/order/order.module';
import { ProductModule } from '@modules/product';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@shared/prisma';
import { RedisModule } from '@shared/redis';
import { TestingModule } from 'src/testing/testing.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RedisModule,
    AuthModule,
    UserModule,
    ProductModule,
    CategoryModule,
    OrderModule,
    ...(process.env.NODE_ENV === 'test' ? [TestingModule] : []),
  ],
})
export class AppModule {}
