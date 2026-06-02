import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './role.entity';

@Injectable()
export class RolesService {
  constructor(@InjectRepository(Role) private readonly rolesRepo: Repository<Role>) {}

  findAll() {
    return this.rolesRepo.find({ order: { id: 'ASC' } });
  }

  async findByName(name: string) {
    const role = await this.rolesRepo.findOne({ where: { name } });
    if (!role) {
      throw new NotFoundException(`Роль ${name} не найдена`);
    }
    return role;
  }
}
