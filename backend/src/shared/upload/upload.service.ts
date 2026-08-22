import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {
  buildFileUrl(filename: string): string {
    return `${process.env.APP_URL}/uploads/${filename}`;
  }
}
