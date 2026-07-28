import type { UserResponseDto } from '@/model/user';

export class AccessTokenResponseDto {
  readonly user: UserResponseDto;
  readonly accessToken: string;
  constructor(props: { user: UserResponseDto; accessToken: string }) {
    this.user = props.user;
    this.accessToken = props.accessToken;
  }
}
