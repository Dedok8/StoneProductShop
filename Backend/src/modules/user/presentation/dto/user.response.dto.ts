import { UserRole } from '@modules/user/domain';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 'a3f1c2e4-...' })
  readonly id: string;

  @ApiProperty({ example: 'user@example.com' })
  readonly email: string;

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  readonly role: UserRole;

  @ApiProperty({ example: '2026-06-17T12:00:00.000Z' })
  readonly createdAt: Date;

  constructor(props: {
    id: string;
    email: string;
    role: UserRole;
    createdAt: Date;
  }) {
    this.id = props.id;
    this.email = props.email;
    this.role = props.role;
    this.createdAt = props.createdAt;
  }
}
