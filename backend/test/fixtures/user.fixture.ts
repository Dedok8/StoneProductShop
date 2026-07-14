import { randomUUID } from 'node:crypto';

import type { CreateUserDto } from '@/model';
import type { HashService, PrismaService } from '@/shared';

export interface ValidUserDto extends CreateUserDto {
  id: string;
}

export const createValidUserDto = (
  overrides: Partial<ValidUserDto> = {},
): ValidUserDto => {
  const uniqueId = Math.floor(Math.random() * 100000);

  return {
    id: randomUUID(),
    email: `test_user_${uniqueId}@example.com`,
    password: 'Password123!',
    name: `Stone Shop Test User ${uniqueId}`,
    role: 'USER',
    ...overrides,
  };
};

export class UserFixture {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashService: HashService,
  ) {}

  async create(overrides: Partial<ValidUserDto> = {}) {
    const mockData = createValidUserDto(overrides);
    const hashedPassword = await this.hashService.hash(mockData.password);

    return this.prisma.user.create({
      data: {
        id: mockData.id,
        name: mockData.name,
        email: mockData.email,
        passwordHash: hashedPassword,
        role: mockData.role,
      },
    });
  }

  async cleanDB() {
    await this.prisma.user.deleteMany({
      where: { email: { contains: 'test_user_' } },
    });
  }
}
