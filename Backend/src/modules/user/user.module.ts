import { UserService } from '@modules/user/application';
import { UserRepository } from '@modules/user/domain';
import { UserPrismaRepository } from '@modules/user/infrastructure';
import {
  AdminUserController,
  UserController,
} from '@modules/user/presentation';
import { Module } from '@nestjs/common';
import { HashService } from '@shared/services';

@Module({
  controllers: [AdminUserController, UserController],
  providers: [
    UserService,
    HashService,
    { provide: UserRepository, useClass: UserPrismaRepository },
  ],
  exports: [UserService, UserRepository],
})
export class UserModule {}
