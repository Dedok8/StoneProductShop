import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from '@/model/auth/application';
import { TokenService } from '@/model/auth/application/token';
import {
  JWTAccessStrategy,
  JWTRefreshStrategy,
} from '@/model/auth/infrastructure';
import { AuthController } from '@/model/auth/presentation';
import { UserModule } from '@/model/user';
import { HashModule } from '@/shared';

@Module({
  imports: [HashModule, PassportModule, JwtModule.register({}), UserModule],
  controllers: [AuthController],
  providers: [AuthService, TokenService, JWTAccessStrategy, JWTRefreshStrategy],
})
export class AuthModule {}
