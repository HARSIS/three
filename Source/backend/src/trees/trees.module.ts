import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TreeNode } from '../tree-nodes/tree-node.entity';
import { Tree } from './tree.entity';
import { TreesController } from './trees.controller';
import { TreesService } from './trees.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tree, TreeNode])],
  controllers: [TreesController],
  providers: [TreesService],
  exports: [TreesService],
})
export class TreesModule {}
