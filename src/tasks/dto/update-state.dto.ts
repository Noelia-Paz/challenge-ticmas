import { IsInt, IsNotEmpty, IsString, IsIn } from 'class-validator';
export class UpdateStateDto {
  @IsInt()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELETED'])
  state: string;
}
