import { UserMapper } from '@modules/user/application/mapper/user.mapper';
import { UserRepository } from '@modules/user/domain';
import { UpdateUserDto } from '@modules/user/presentation/dto';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async findById(id: string) {
    const user = await this.userRepo.findById(id);

    if (!user) throw new NotFoundException('User not found');

    return UserMapper.toResponse(user);
  }

  async getAllUsers() {
    const users = await this.userRepo.findAll();

    return users.map((user) => UserMapper.toResponse(user));
  }

  async update(id: string, data: UpdateUserDto) {
    const user = await this.userRepo.update(id, data);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return UserMapper.toResponse(user);
  }

  async delete(id: string) {
    const user = await this.userRepo.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepo.delete(id);
  }
}
