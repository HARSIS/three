import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tree } from '../trees/tree.entity';
import { CreateTreeNodeDto } from './dto/create-tree-node.dto';
import { UpdateTreeNodeDto } from './dto/update-tree-node.dto';
import { TreeNode } from './tree-node.entity';

interface RequestUser {
  id: number;
  role: string;
}

@Injectable()
export class TreeNodesService {
  constructor(
    @InjectRepository(TreeNode) private readonly nodesRepo: Repository<TreeNode>,
    @InjectRepository(Tree) private readonly treesRepo: Repository<Tree>,
  ) {}

  async findByTree(treeId: number, user: RequestUser) {
    const tree = await this.getTreeWithAccess(treeId, user, false);
    return this.nodesRepo.find({
      where: { treeId: tree.id },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
  }

  async create(dto: CreateTreeNodeDto, user: RequestUser) {
    await this.getTreeWithAccess(dto.treeId, user, true);
    await this.validateParent(dto.treeId, dto.parentId);

    const node = this.nodesRepo.create({
      treeId: dto.treeId,
      parentId: dto.parentId,
      title: dto.title,
      content: dto.content,
      sortOrder: dto.sortOrder ?? 0,
    });

    return this.nodesRepo.save(node);
  }

  async update(id: number, dto: UpdateTreeNodeDto, user: RequestUser) {
    const node = await this.nodesRepo.findOne({ where: { id } });
    if (!node) {
      throw new NotFoundException('Узел не найден');
    }

    await this.getTreeWithAccess(node.treeId, user, true);
    if (dto.parentId !== undefined) {
      await this.validateParent(node.treeId, dto.parentId);
    }

    Object.assign(node, {
      title: dto.title ?? node.title,
      content: dto.content ?? node.content,
      parentId: dto.parentId ?? node.parentId,
      sortOrder: dto.sortOrder ?? node.sortOrder,
    });

    return this.nodesRepo.save(node);
  }

  async remove(id: number, user: RequestUser) {
    const node = await this.nodesRepo.findOne({ where: { id } });
    if (!node) {
      throw new NotFoundException('Узел не найден');
    }

    await this.getTreeWithAccess(node.treeId, user, true);
    await this.nodesRepo.delete(id);
    return { deleted: true };
  }

  private async getTreeWithAccess(treeId: number, user: RequestUser, write: boolean) {
    const tree = await this.treesRepo.findOne({ where: { id: treeId } });
    if (!tree) {
      throw new NotFoundException('Дерево не найдено');
    }

    if (user.role === 'ADMIN') {
      return tree;
    }

    if (write && tree.ownerId !== user.id) {
      throw new ForbiddenException('Нет прав на изменение дерева');
    }

    if (!write && !tree.isPublic && tree.ownerId !== user.id) {
      throw new ForbiddenException('Нет доступа к дереву');
    }

    return tree;
  }

  private async validateParent(treeId: number, parentId?: number) {
    if (!parentId) {
      return;
    }

    const parent = await this.nodesRepo.findOne({ where: { id: parentId } });
    if (!parent || parent.treeId !== treeId) {
      throw new BadRequestException('Родительский узел должен принадлежать тому же дереву');
    }
  }
}
