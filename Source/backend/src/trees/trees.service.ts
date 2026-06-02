import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TreeNode } from '../tree-nodes/tree-node.entity';
import { CreateTreeDto } from './dto/create-tree.dto';
import { UpdateTreeDto } from './dto/update-tree.dto';
import { Tree } from './tree.entity';

interface RequestUser {
  id: number;
  role: string;
}

@Injectable()
export class TreesService {
  constructor(
    @InjectRepository(Tree) private readonly treesRepo: Repository<Tree>,
    @InjectRepository(TreeNode) private readonly nodesRepo: Repository<TreeNode>,
  ) {}

  async findAll(user: RequestUser) {
    if (user.role === 'ADMIN') {
      return this.treesRepo.find({ order: { id: 'ASC' } });
    }

    return this.treesRepo
      .createQueryBuilder('tree')
      .leftJoinAndSelect('tree.owner', 'owner')
      .where('tree.isPublic = :isPublic', { isPublic: true })
      .orWhere('tree.ownerId = :ownerId', { ownerId: user.id })
      .orderBy('tree.id', 'ASC')
      .getMany();
  }

  async findOne(id: number, user: RequestUser) {
    const tree = await this.treesRepo.findOne({ where: { id } });
    if (!tree) {
      throw new NotFoundException('Дерево не найдено');
    }
    this.checkReadAccess(tree, user);
    return tree;
  }

  async create(dto: CreateTreeDto, user: RequestUser) {
    const tree = this.treesRepo.create({
      title: dto.title,
      description: dto.description,
      isPublic: dto.isPublic ?? false,
      ownerId: user.id,
    });
    return this.treesRepo.save(tree);
  }

  async update(id: number, dto: UpdateTreeDto, user: RequestUser) {
    const tree = await this.findOne(id, user);
    this.checkWriteAccess(tree, user);
    Object.assign(tree, dto);
    return this.treesRepo.save(tree);
  }

  async remove(id: number, user: RequestUser) {
    const tree = await this.findOne(id, user);
    this.checkWriteAccess(tree, user);
    await this.treesRepo.delete(id);
    return { deleted: true };
  }

  async getNestedTree(id: number, user: RequestUser) {
    await this.findOne(id, user);
    const nodes = await this.nodesRepo.find({
      where: { treeId: id },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
    return this.buildTree(nodes);
  }

  private buildTree(nodes: TreeNode[]) {
    const map = new Map<number, TreeNode & { children: TreeNode[] }>();
    nodes.forEach((node) => map.set(node.id, { ...node, children: [] }));

    const roots: Array<TreeNode & { children: TreeNode[] }> = [];
    map.forEach((node) => {
      if (node.parentId && map.has(node.parentId)) {
        map.get(node.parentId)?.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  private checkReadAccess(tree: Tree, user: RequestUser) {
    if (user.role === 'ADMIN' || tree.isPublic || tree.ownerId === user.id) {
      return;
    }
    throw new ForbiddenException('Нет доступа к дереву');
  }

  private checkWriteAccess(tree: Tree, user: RequestUser) {
    if (user.role === 'ADMIN' || tree.ownerId === user.id) {
      return;
    }
    throw new ForbiddenException('Нет прав на изменение дерева');
  }
}
