import { PartialType } from '@nestjs/mapped-types';
import { CreateTreeNodeDto } from './create-tree-node.dto';

export class UpdateTreeNodeDto extends PartialType(CreateTreeNodeDto) {}
