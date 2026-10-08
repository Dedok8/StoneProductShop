import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  constructor(private readonly configService: ConfigService) {}

  buildFileUrl(filename: string): string {
    const appUrl =
      this.configService.get<string>('APP_URL') ??
      `http://localhost:${this.configService.get<string>('PORT', '3000')}`;

    return `${appUrl}/uploads/${filename}`;
  }
}
