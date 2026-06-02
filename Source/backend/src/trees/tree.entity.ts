import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TreeNode } from '../tree-nodes/tree-node.entity';
import { User } from '../users/user.entity';

@Entity('trees')
export class Tree {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 180 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'owner_id' })
  ownerId: number;

  @Column({ name: 'is_public', default: false })
  isPublic: boolean;

  @ManyToOne(() => User, (user) => user.trees, { eager: true })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => TreeNode, (node) => node.tree)
  nodes: TreeNode[];
}
