import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { Role } from '../roles/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(Role) private readonly rolesRepo: Repository<Role>,
  ) {}

  async findAll() {
    const users = await this.usersRepo.find({ order: { id: 'ASC' } });
    return users.map((user) => this.toPublicUser(user));
  }

  async findOne(id: number) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return this.toPublicUser(user);
  }

  findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email } });
  }

  async create(dto: CreateUserDto) {
    const exists = await this.findByEmail(dto.email);
    if (exists) {
      throw new BadRequestException('Пользователь с таким email уже существует');
    }

    const roleName = dto.role || 'VIEWER';
    const role = await this.rolesRepo.findOne({ where: { name: roleName } });
    if (!role) {
      throw new BadRequestException('Указанная роль не найдена');
    }

    const password = dto.password || 'password';
    const passwordHash = await bcrypt.hash(password, 10);

    const user = this.usersRepo.create({
      name: dto.name,
      email: dto.email,
      age: dto.age,
      role,
      roleId: role.id,
      passwordHash,
    });

    return this.usersRepo.save(user);
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (dto.role) {
      const role = await this.rolesRepo.findOne({ where: { name: dto.role } });
      if (!role) {
        throw new BadRequestException('Указанная роль не найдена');
      }
      user.role = role;
      user.roleId = role.id;
    }

    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    Object.assign(user, {
      name: dto.name ?? user.name,
      email: dto.email ?? user.email,
      age: dto.age ?? user.age,
    });

    const saved = await this.usersRepo.save(user);
    return this.toPublicUser(saved);
  }

  async remove(id: number) {
    const result = await this.usersRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Пользователь не найден');
    }
    return { deleted: true };
  }

  toPublicUser(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      age: user.age,
      role: user.role?.name,
    };
  }
}
