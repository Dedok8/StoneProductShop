import { UserRole } from '../../domain/user-role.enum';

export class UserResponseDto {
  constructor(
    public readonly id: string,
    public email: string,
    public role: UserRole,
    public readonly createdAt: Date,
  ) {}
}
