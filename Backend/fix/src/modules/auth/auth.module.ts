import { AuthService } from '@modules/auth/application';
import { TokenService } from '@modules/auth/infrastructure';
import { JwtAccessStrategy } from '@modules/auth/infrastructure/strategies';
import { AuthController } from '@modules/auth/presentation';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { HashService } from '@shared/services';

@Module({
  imports: [PassportModule, JwtModule.register({}), UserModule],
  controllers: [AuthController],
  providers: [AuthService, TokenService, HashService, JwtAccessStrategy],
})
export class AuthModule {}
