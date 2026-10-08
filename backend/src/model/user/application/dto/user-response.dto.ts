import type { USER_ROLE } from '@stone-shop/shared';

export class UserResponseDto {
  readonly id: string;

  readonly name: string;

  readonly email: string;

  readonly role: USER_ROLE;

  readonly createdAt: Date;

  constructor(props: {
    id: string;
    name: string;

    email: string;
    role: USER_ROLE;
    createdAt: Date;
  }) {
    this.id = props.id;
    this.name = props.name;

    this.email = props.email;
    this.role = props.role;
    this.createdAt = props.createdAt;
  }
}
