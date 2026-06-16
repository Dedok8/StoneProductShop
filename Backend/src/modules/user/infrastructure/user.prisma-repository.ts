import { UserEntity, UserRepository, UserRole } from '@modules/user/domain';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/prisma';
import { User, Role as PrismaRole } from '@prisma/client';

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
    return users.map(this.mapToEntity.bind(this));
  }

  async create(data: Partial<UserEntity>): Promise<UserEntity> {
    const created = await this.prisma.user.create({
      data: {
        email: data.email!,
        passwordHash: data.passwordHash!,
        role: data.role as PrismaRole,
      },
    });

    return this.mapToEntity(created);
  }

  async update(id: string, data: Partial<UserEntity>): Promise<UserEntity> {
    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...data,
        role: data.role,
      },
    });

    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
