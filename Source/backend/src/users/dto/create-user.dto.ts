import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  age?: number;

  @IsOptional()
  @IsString()
  role?: 'ADMIN' | 'EDITOR' | 'VIEWER';

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
