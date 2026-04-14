import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  async findByCompany(companyId: string) {
    const users = await this.usersRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' }
    });

    return { success: true, data: users, error: null, meta: null };
  }
}
