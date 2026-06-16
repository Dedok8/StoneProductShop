import { UserRole } from './user-role.enum';

export class UserEntity {
  constructor(
    public readonly id: string,
    public email: string,
    public passwordHash: string,
    public role: UserRole,
    public refreshToken: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}
