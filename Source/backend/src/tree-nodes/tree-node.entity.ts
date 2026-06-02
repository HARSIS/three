import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { NodeComment } from '../comments/node-comment.entity';
import { Tree } from '../trees/tree.entity';

@Entity('tree_nodes')
export class TreeNode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'tree_id' })
  treeId: number;

  @Column({ name: 'parent_id', nullable: true })
  parentId?: number;

  @Column({ length: 180 })
  title: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @ManyToOne(() => Tree, (tree) => tree.nodes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tree_id' })
  tree: Tree;

  @ManyToOne(() => TreeNode, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parent?: TreeNode;

  @OneToMany(() => NodeComment, (comment) => comment.node)
  comments: NodeComment[];
}
