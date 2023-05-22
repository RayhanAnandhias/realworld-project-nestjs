import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ArticleUpdateDto {
  @IsString()
  @IsOptional()
  title?: string;
  @IsString()
  @IsOptional()
  description?: string;
  @IsString()
  @IsOptional()
  body?: string;
}

export class UpdateArticleDto {
  @ValidateNested()
  @Type(() => ArticleUpdateDto)
  article: ArticleUpdateDto;
}
