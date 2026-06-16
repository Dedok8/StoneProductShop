import { UserService } from '@modules/user/application';
import { UserRepository } from '@modules/user/domain';
import { UserPrismaRepository } from '@modules/user/infrastructure';
import { AdminUserController } from '@modules/user/presentation/admin-user.controller';
import { UserController } from '@modules/user/presentation/user.controller';
import { Module } from '@nestjs/common';

@Module({
  controllers: [AdminUserController, UserController],
  providers: [
    UserService,
    { provide: UserRepository, useClass: UserPrismaRepository },
  ],
  exports: [UserService, UserRepository],
})
export class UserModule {}
