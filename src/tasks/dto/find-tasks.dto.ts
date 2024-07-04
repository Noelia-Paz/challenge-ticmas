import { IsIn, IsNotEmpty, IsString } from 'class-validator';
export class FindTasksDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELETED'])
  state: string;
}
