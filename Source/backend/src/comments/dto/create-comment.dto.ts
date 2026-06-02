import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsInt()
  nodeId: number;

  @IsString()
  @IsNotEmpty()
  text: string;
}
