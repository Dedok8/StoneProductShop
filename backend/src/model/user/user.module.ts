import { Module } from '@nestjs/common';

import { UserService } from '@/model/user/application';
import { USER_REPOSITORY } from '@/model/user/domain';
import { UserRepository } from '@/model/user/infrastructure';
import { AdminController, UserController } from '@/model/user/presentation';
import { HashService } from '@/shared';

@Module({
  controllers: [UserController, AdminController],
  providers: [
    UserService,
    HashService,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
  ],
  exports: [UserService, USER_REPOSITORY],
})
export class UserModule {}
