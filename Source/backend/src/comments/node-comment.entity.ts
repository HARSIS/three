import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TreeNode } from '../tree-nodes/tree-node.entity';
import { User } from '../users/user.entity';

@Entity('node_comments')
export class NodeComment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'node_id' })
  nodeId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ type: 'text' })
  text: string;

  @ManyToOne(() => TreeNode, (node) => node.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'node_id' })
  node: TreeNode;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
