import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TreeNode } from '../tree-nodes/tree-node.entity';
import { NodeComment } from './node-comment.entity';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

@Module({
  imports: [TypeOrmModule.forFeature([NodeComment, TreeNode])],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
