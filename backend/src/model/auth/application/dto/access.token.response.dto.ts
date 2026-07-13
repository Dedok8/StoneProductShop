export class AccessTokenResponseDto {
  readonly accessToken: string;

  constructor(props: { accessToken: string }) {
    this.accessToken = props.accessToken;
  }
}
