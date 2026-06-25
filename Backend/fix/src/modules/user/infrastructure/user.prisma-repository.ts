import { UserEntity, UserRepository, UserRole } from '@modules/user/domain';
import type {
  CreateUserData,
  UpdateUserData,
} from '@modules/user/domain/user.types';
import { Injectable } from '@nestjs/common';
import { Prisma, User, Role as PrismaRole } from '@prisma/client';
import { PrismaService } from '@shared/prisma';

@Injectable()
export class UserPrismaRepository extends UserRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  private mapToEntity(dbUser: User): UserEntity {
    return new UserEntity(
      dbUser.id,
      dbUser.email,
      dbUser.passwordHash,
      dbUser.role as UserRole,
      dbUser.refreshToken,
      dbUser.createdAt,
      dbUser.updatedAt,
    );
  }

  async findById(id: string): Promise<UserEntity | null> {
    const dbUser = await this.prisma.user.findUnique({ where: { id } });
    if (!dbUser) return null;

    return this.mapToEntity(dbUser);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.mapToEntity(user) : null;
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany();

    return users.map((user) => this.mapToEntity(user));
  }

  async create(data: CreateUserData): Promise<UserEntity> {
    const created = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role as PrismaRole,
      },
    });

    return this.mapToEntity(created);
  }

  // Returns null if the user does not exist (Prisma P2025),
  // matching the abstract UserRepository contract.
  async update(id: string, data: UpdateUserData): Promise<UserEntity | null> {
    try {
      const updated = await this.prisma.user.update({
        where: { id },
        data,
      });

      return this.mapToEntity(updated);
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        return null;
      }
      throw e;
    }
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
