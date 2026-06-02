import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateTreeNodeDto {
  @IsInt()
  treeId: number;

  @IsOptional()
  @IsInt()
  parentId?: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
