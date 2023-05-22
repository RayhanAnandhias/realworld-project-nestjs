import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PrismaService } from 'src/prisma.service';
import {
  MultipleCommentResponse,
  SingleCommentResponse,
} from './dto/comment-response.dto';
import { ArticlesService } from 'src/articles/articles.service';
import { randomUUID } from 'crypto';

@Injectable()
export class CommentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly articleService: ArticlesService,
  ) {}

  async create(
    params: { slug: string; authorId: string },
    createCommentDto: CreateCommentDto,
  ): Promise<SingleCommentResponse> {
    const newId = randomUUID();
    const article = await this.articleService.findOne(params.slug);
    const { id: articleId } = article.article;
    const insertComment = await this.prisma
      .$queryRaw`INSERT INTO "Comment" (id, body, "userId", "articleId") VALUES (${newId}, ${createCommentDto.comment.body}, ${params.authorId}, ${articleId}) RETURNING id, body`;
    const result = await this.findOne(insertComment[0].id, params.authorId);

    return result;
  }

  async findAll(
    slug: string,
    currentUserId?: string,
  ): Promise<MultipleCommentResponse> {
    const article = await this.articleService.findOne(slug);
    let process: any[] = [];
    process = await this.prisma
      .$queryRaw`SELECT c.id , c.body , c.created_at , c.updated_at , c."userId" , c."articleId" , u.username, u.bio, u.image, CASE WHEN f."A" IS NULL THEN 0 ELSE 1 END AS "following" FROM "Comment" as c INNER JOIN "User" AS u ON u.id = c."userId" LEFT JOIN "_followers" AS f ON f."A" = ${
      currentUserId || ''
    } AND f."B" = u.id WHERE c."articleId" = ${article.article.id}`;
    const result = {
      comment: process.map((item) => ({
        id: item.id,
        body: item.body,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        author: {
          username: item.username,
          bio: item.bio,
          image: item.image,
          following: Boolean(item.following),
        },
      })),
    } as MultipleCommentResponse;
    return result;
  }

  async findOne(
    id: string,
    currentUserId: string,
  ): Promise<SingleCommentResponse | null> {
    const process = await this.prisma
      .$queryRaw`SELECT c.id , c.body , c.created_at , c.updated_at , c."userId" , c."articleId" , u.username, u.bio, u.image, CASE WHEN f."A" IS NULL THEN 0 ELSE 1 END AS "following" FROM "Comment" as c INNER JOIN "User" AS u ON u.id = c."userId" LEFT JOIN "_followers" AS f ON f."A" = ${currentUserId} AND f."B" = u.id WHERE c.id = ${id}`;
    const result = {
      comment: {
        id: process[0].id,
        body: process[0].body,
        createdAt: process[0].created_at,
        updatedAt: process[0].updated_at,
        author: {
          username: process[0].username,
          bio: process[0].bio,
          image: process[0].image,
          following: Boolean(process[0].following),
        },
      },
    } as SingleCommentResponse;
    return result;
  }

  async remove(idComment: string): Promise<void> {
    await this.prisma.$queryRaw`DELETE FROM "Comment" WHERE id = ${idComment}`;
  }
}
