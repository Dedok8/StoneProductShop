import { Injectable } from '@nestjs/common';

import { Role, User } from '@/generated/prisma/client';
import {
  ICreateUserData,
  IUpdateUserData,
  IUserFindAllResult,
  IUserQuery,
  IUserRepository,
  UserEntity,
} from '@/model/user/domain';
import {
  buildContainsFilter,
  buildQueryCacheKey,
  createAndInvalidate,
  deleteAndInvalidate,
  findManyCached,
  findOneCached,
  PrismaService,
  RedisCacheService,
} from '@/shared';
import { updateAndInvalidate } from '@/shared/utils/update-and-invalidate.utils';

const DETAIL_TTL_SEC = 5 * 60;
const LIST_TTL_SEC = 60;

const idKey = (id: string) => `user:id:${id}`;
const emailKey = (email: string) => `user:email:${email}`;
const listPattern = 'user:list:*';
const listKey = (query: IUserQuery) => buildQueryCacheKey('user:list', query);

type CachedUser = Omit<User, 'refreshToken'>;

const stripForCache = (user: User): CachedUser => {
  const { refreshToken: _refreshToken, ...safe } = user;
  return safe;
};

const withNullRefreshToken = (cached: CachedUser): User => ({
  ...cached,
  refreshToken: null,
});

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: RedisCacheService,
  ) {}

  findById(id: string): Promise<UserEntity | null> {
    return findOneCached<CachedUser, User, UserEntity>({
      cache: this.cache,
      key: idKey(id),
      ttl: DETAIL_TTL_SEC,
      fetch: () => this.prisma.user.findUnique({ where: { id } }),
      entityClass: UserEntity,
      toCache: stripForCache,
      fromCache: withNullRefreshToken,
    });
  }

  findByEmail(email: string): Promise<UserEntity | null> {
    return findOneCached<CachedUser, User, UserEntity>({
      cache: this.cache,
      key: emailKey(email),
      ttl: DETAIL_TTL_SEC,
      fetch: () => this.prisma.user.findUnique({ where: { email } }),
      entityClass: UserEntity,
      toCache: stripForCache,
      fromCache: withNullRefreshToken,
    });
  }

  findAll(query: IUserQuery): Promise<IUserFindAllResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where = {
      OR: query.search
        ? [
            { name: buildContainsFilter(query.search) },
            { email: buildContainsFilter(query.search) },
          ]
        : undefined,
    };

    return findManyCached<CachedUser, User, UserEntity>({
      cache: this.cache,
      key: listKey(query),
      ttl: LIST_TTL_SEC,
      entityClass: UserEntity,
      toCache: stripForCache,
      fromCache: withNullRefreshToken,
      fetch: async () => {
        const [items, total] = await Promise.all([
          this.prisma.user.findMany({
            where,
            orderBy: query.sortBy
              ? { [query.sortBy]: query.sortOrder ?? 'asc' }
              : { createdAt: query.sortOrder ?? 'desc' },
            skip: (page - 1) * limit,
            take: limit,
          }),
          this.prisma.user.count({ where }),
        ]);

        return { items, total };
      },
    });
  }

  create(data: ICreateUserData): Promise<UserEntity> {
    return createAndInvalidate({
      createFn: () =>
        this.prisma.user.create({
          data: {
            name: data.name,
            email: data.email,
            passwordHash: data.passwordHash,
            role: data.role,
          },
        }),
      cache: this.cache,
      invalidateKeys: (user) => [
        idKey(user.id),
        emailKey(user.email),
        listPattern,
      ],
      entityClass: UserEntity,
    });
  }

  update(id: string, data: IUpdateUserData): Promise<UserEntity | null> {
    return updateAndInvalidate({
      updateFn: () => this.prisma.user.update({ where: { id }, data }),
      cache: this.cache,
      invalidateKeys: (user) => [
        idKey(user.id),
        emailKey(user.email),
        listPattern,
      ],
      entityClass: UserEntity,
    });
  }

  updateRole(id: string, role: Role): Promise<UserEntity | null> {
    return updateAndInvalidate({
      updateFn: () =>
        this.prisma.user.update({ where: { id }, data: { role } }),
      cache: this.cache,
      invalidateKeys: (user) => [
        idKey(user.id),
        emailKey(user.email),
        listPattern,
      ],
      entityClass: UserEntity,
    });
  }

  delete(id: string): Promise<void> {
    return deleteAndInvalidate({
      deleteFn: () => this.prisma.user.delete({ where: { id } }),
      cache: this.cache,
      invalidateKeys: (user) => [
        idKey(user.id),
        emailKey(user.email),
        listPattern,
      ],
    });
  }
}
