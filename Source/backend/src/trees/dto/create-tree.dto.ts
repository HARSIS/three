import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTreeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
