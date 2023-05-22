import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ArticleDto {
  @IsString()
  @IsNotEmpty()
  title: string;
  @IsString()
  @IsOptional()
  description?: string;
  @IsString()
  @IsNotEmpty()
  body: string;
  @IsArray()
  @IsOptional()
  tagList?: Array<string>;
}

export class CreateArticleDto {
  @ValidateNested()
  @Type(() => ArticleDto)
  article: ArticleDto;
}
