import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class CommentDto {
  @IsString()
  @IsNotEmpty()
  body: string;
}

export class CreateCommentDto {
  @ValidateNested()
  @Type(() => CommentDto)
  comment: CommentDto;
}
