import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TreeNode } from '../tree-nodes/tree-node.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { NodeComment } from './node-comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(NodeComment) private readonly commentsRepo: Repository<NodeComment>,
    @InjectRepository(TreeNode) private readonly nodesRepo: Repository<TreeNode>,
  ) {}

  async findByNode(nodeId: number) {
    return this.commentsRepo.find({ where: { nodeId }, order: { id: 'ASC' } });
  }

  async create(dto: CreateCommentDto, userId: number) {
    const node = await this.nodesRepo.findOne({ where: { id: dto.nodeId } });
    if (!node) {
      throw new NotFoundException('Узел не найден');
    }

    const comment = this.commentsRepo.create({
      nodeId: dto.nodeId,
      userId,
      text: dto.text,
    });
    return this.commentsRepo.save(comment);
  }
}
