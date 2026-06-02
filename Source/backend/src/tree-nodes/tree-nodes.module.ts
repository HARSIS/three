import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tree } from '../trees/tree.entity';
import { TreeNode } from './tree-node.entity';
import { TreeNodesController } from './tree-nodes.controller';
import { TreeNodesService } from './tree-nodes.service';

@Module({
  imports: [TypeOrmModule.forFeature([TreeNode, Tree])],
  controllers: [TreeNodesController],
  providers: [TreeNodesService],
})
export class TreeNodesModule {}
