import type { UserRole } from '@/shared/guards/role/user-role';

export class UserResponseDto {
  readonly id: string;

  readonly name: string;

  readonly email: string;

  readonly role: UserRole;

  readonly createdAt: Date;

  constructor(props: {
    id: string;
    name: string;

    email: string;
    role: UserRole;
    createdAt: Date;
  }) {
    this.id = props.id;
    this.name = props.name;

    this.email = props.email;
    this.role = props.role;
    this.createdAt = props.createdAt;
  }
}
