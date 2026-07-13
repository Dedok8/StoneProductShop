import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';

import { Prisma, PrismaClient } from '@/generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 5000,
      // ssl: { rejectUnauthorized: false }
    });

    super({
      adapter,
      log:
        process.env.NODE_ENV === 'development'
          ? [
              { emit: 'event', level: 'query' },
              { emit: 'event', level: 'warn' },
              { emit: 'event', level: 'error' },
            ]
          : [
              { emit: 'event', level: 'warn' },
              { emit: 'event', level: 'error' },
            ],
    });
  }

  async onModuleInit() {
    if (process.env.NODE_ENV === 'development') {
      this.$on('query' as never, (e: Prisma.QueryEvent) => {
        this.logger.debug(`Query: ${e.query}`);
        this.logger.debug(`Params: ${e.params}`);
        this.logger.debug(`Duration: ${e.duration}ms`);
      });
    }
    this.$on('warn' as never, (e: Prisma.LogEvent) => {
      this.logger.warn(e.message);
    });

    this.$on('error' as never, (e: Prisma.LogEvent) => {
      this.logger.error(e.message);
    });

    await this.$connect();
    this.logger.log('Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  async onCleanDatabase() {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('cleanDatabase is only allowed in the test environment');
    }

    const tablenames = await this.$queryRaw<{ tablename: string }[]>`
    SELECT tablename
      FROM pg_tables
      WHERE schemaname='public'
      `;

    for (const { tablename } of tablenames) {
      if (tablename !== '_prisma_migrations') {
        await this.$executeRawUnsafe(
          `TRUNCATE TABLE "${tablename}" CASCADE RESTART IDENTITY;`,
        );
      }
    }
  }
}
