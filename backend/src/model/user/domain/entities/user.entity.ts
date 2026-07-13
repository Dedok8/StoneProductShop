import type { UserRole } from '@/shared/guards/role/user-role';

export class UserEntity {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly role: UserRole;
  readonly refreshToken: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    refreshToken: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.role = props.role;
    this.refreshToken = props.refreshToken;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static fromPersistence(raw: {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    refreshToken: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): UserEntity {
    return new UserEntity({ ...raw });
  }
}
