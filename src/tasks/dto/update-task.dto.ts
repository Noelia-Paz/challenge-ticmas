import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  description: string;
}
