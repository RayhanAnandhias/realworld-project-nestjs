import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ReadTagDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  page?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  limit?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  orderBy?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;
}

export class TagsResponse {
  tags: Array<string>;
}
