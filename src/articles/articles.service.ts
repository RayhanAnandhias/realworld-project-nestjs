import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { PrismaService } from 'src/prisma.service';
import { ReadArticleDto } from './dto/read-article.dto';
import {
  ArticleResponse,
  MultipleArticleResponse,
  SingleArticleResponse,
} from './dto/article-response.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  async create(
    createArticleDto: CreateArticleDto,
    idAuthor: string,
  ): Promise<any | null> {
    const newId = randomUUID();
    const { article } = createArticleDto;
    const { title, description, body, tagList } = article;
    const slug = title.trim().replace(/\s/g, '-').toLowerCase();
    const insertingArticle = await this.prisma
      .$queryRaw`INSERT INTO "Article" VALUES (${newId}, ${slug}, ${title}, ${description}, ${body}, DEFAULT, DEFAULT, DEFAULT, ${idAuthor}) RETURNING *`;

    // inserting tags from tagList
    for (const tag of tagList) {
      const loweredTag = tag.trim().toLowerCase();
      const queryTag = await this.prisma
        .$queryRaw`SELECT id, "name" FROM "Tag" WHERE "name" = ${loweredTag}`;
      let tagId = queryTag?.[0]?.id || null;
      const isExistTag = Boolean(queryTag?.[0]);
      if (!isExistTag) {
        const insertingTag = await this.prisma
          .$queryRaw`INSERT INTO "Tag" ("name") VALUES (${loweredTag}) RETURNING id`;
        tagId = insertingTag?.[0]?.id;
      }
      await this.prisma
        .$executeRaw`INSERT INTO "_ArticleToTag" VALUES (${insertingArticle[0].id}, ${tagId})`;
    }

    // get single article

    const result = await this.findOne(insertingArticle[0].slug, idAuthor);
    return result;
  }

  async findAll(
    currentUserId: string,
    readArticleDto: ReadArticleDto,
  ): Promise<MultipleArticleResponse> {
    const { page, limit, author, favorited, tag } = readArticleDto;
    console.log(page, limit, author, favorited, tag);
    const keywordAuthor = author || '';
    const keywordFavorited = favorited || '';
    const keywordTag = tag || '';
    const filterAuthor = '%' + keywordAuthor + '%';
    const filterFavorited = '%' + keywordFavorited + '%';
    const filterTag = '%' + keywordTag + '%';
    let offset = 0;
    const isPagination =
      page !== null &&
      page !== undefined &&
      page !== '' &&
      limit !== null &&
      limit !== undefined &&
      limit !== '';

    if (isPagination) {
      offset = Number(limit) * Number(page) - Number(limit);
    }

    let result: any[] = [];

    console.log(currentUserId);

    if (isPagination) {
      result = await this.prisma.$queryRaw`
        SELECT 
          a.id, 
          a.slug, 
          a.title, 
          a.description, 
          a.body, 
          a.favorites_count, 
          a.created_at, 
          a.updated_at, 
          a."authorId", 
          u.username, 
          u.bio, 
          u.image, 
          CASE WHEN f."A" IS NULL THEN 0 ELSE 1 END AS "following", 
          att."B" AS "tag_id", 
          t.name AS "tag_name", 
          l."userId" AS "liked_by", 
          ul.username AS "liked_by_username", 
          CASE WHEN l."userId" IS NULL THEN 0 ELSE 1 END AS "favorited" 
        FROM "Article" AS a 
        INNER JOIN "User" AS u ON u.id = a."authorId" 
        LEFT JOIN "_followers" AS f ON f."A" = ${currentUserId} AND f."B" = u.id 
        LEFT JOIN "_ArticleToTag" AS att ON att."A" = a.id 
        LEFT JOIN "Tag" AS t ON t.id = att."B" 
        LEFT JOIN "Like" AS l ON l."articleId" = a.id  
        LEFT JOIN "User" AS ul ON ul.id = l."userId" 
        WHERE u.username ILIKE ${filterAuthor} OR t."name" ILIKE ${filterTag} OR ul.username ILIKE ${filterFavorited} 
        ORDER BY a.created_at DESC 
        LIMIT ${+limit} 
        OFFSET ${offset}`;
    } else {
      result = await this.prisma.$queryRaw`
        SELECT 
          a."id", 
          a."slug", 
          a."title", 
          a."description", 
          a."body", 
          a."favorites_count", 
          a."created_at", 
          a."updated_at", 
          a."authorId", 
          u."username", 
          u."bio", 
          u."image", 
          CASE WHEN f."A" IS NULL THEN 0 ELSE 1 END AS "following", 
          att."B" AS "tag_id", 
          t."name" AS "tag_name", 
          l."userId" AS "liked_by", 
          ul."username" AS "liked_by_username", 
          CASE WHEN l."userId" IS NULL THEN 0 ELSE 1 END AS "favorited" 
        FROM "Article" AS a 
        INNER JOIN "User" AS u ON u."id" = a."authorId" 
        LEFT JOIN "_followers" AS f ON f."A" = ${currentUserId} AND f."B" = u."id" 
        LEFT JOIN "_ArticleToTag" AS att ON att."A" = a."id" 
        LEFT JOIN "Tag" AS t ON t."id" = att."B" 
        LEFT JOIN "Like" AS l ON l."articleId" = a."id" 
        LEFT JOIN "User" AS ul ON ul."id" = l."userId" 
        WHERE u."username" ILIKE ${filterAuthor} OR t."name" ILIKE ${filterTag} OR ul."username" ILIKE ${filterFavorited} 
        ORDER BY a."created_at" DESC`;
    }

    const uniqueArticleById = [
      ...new Map(result.map((item) => [item['id'], item])).values(),
    ];

    const normalizedData = uniqueArticleById.map(
      (item) =>
        ({
          slug: item.slug,
          title: item.title,
          description: item.description,
          body: item.body,
          tagList: [
            ...new Set(
              result
                .filter((value) => value.id === item.id)
                .map((value) => value.tag_name),
            ),
          ],
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          favorited: Boolean(item.favorited),
          favoritesCount: item.favorites_count,
          author: {
            username: item.username,
            bio: item.bio,
            image: item.image,
            following: Boolean(item.following),
          },
        } as ArticleResponse),
    );

    const mapResponse = {
      articles: normalizedData,
      articlesCount: normalizedData.length,
    } as MultipleArticleResponse;

    return mapResponse;
  }

  async getFeeds(
    currentUserId: string,
    readArticleDto: ReadArticleDto,
  ): Promise<MultipleArticleResponse> {
    const { page, limit } = readArticleDto;
    console.log(page, limit);
    let offset = 0;
    const isPagination =
      page !== null &&
      page !== undefined &&
      page !== '' &&
      limit !== null &&
      limit !== undefined &&
      limit !== '';

    if (isPagination) {
      offset = Number(limit) * Number(page) - Number(limit);
    }

    let result: any[] = [];

    console.log(currentUserId);

    if (isPagination) {
      result = await this.prisma.$queryRaw`
        SELECT 
          a.id, 
          a.slug, 
          a.title, 
          a.description, 
          a.body, 
          a.favorites_count, 
          a.created_at, 
          a.updated_at, 
          a."authorId", 
          u.username, 
          u.bio, 
          u.image, 
          CASE WHEN f."A" IS NULL THEN 0 ELSE 1 END AS "following", 
          att."B" AS "tag_id", 
          t.name AS "tag_name", 
          l."userId" AS "liked_by", 
          ul.username AS "liked_by_username", 
          CASE WHEN l."userId" IS NULL THEN 0 ELSE 1 END AS "favorited" 
        FROM "Article" AS a 
        INNER JOIN "User" AS u ON u.id = a."authorId" 
        INNER JOIN "_followers" AS f ON f."A" = ${currentUserId} AND f."B" = u.id 
        LEFT JOIN "_ArticleToTag" AS att ON att."A" = a.id 
        LEFT JOIN "Tag" AS t ON t.id = att."B" 
        LEFT JOIN "Like" AS l ON l."articleId" = a.id 
        LEFT JOIN "User" AS ul ON ul.id = l."userId" 
        ORDER BY a.created_at DESC 
        LIMIT ${+limit} 
        OFFSET ${offset}`;
    } else {
      result = await this.prisma.$queryRaw`
        SELECT 
          a."id", 
          a."slug", 
          a."title", 
          a."description", 
          a."body", 
          a."favorites_count", 
          a."created_at", 
          a."updated_at", 
          a."authorId", 
          u."username", 
          u."bio", 
          u."image", 
          CASE WHEN f."A" IS NULL THEN 0 ELSE 1 END AS "following", 
          att."B" AS "tag_id", 
          t."name" AS "tag_name", 
          l."userId" AS "liked_by", 
          ul."username" AS "liked_by_username", 
          CASE WHEN l."userId" IS NULL THEN 0 ELSE 1 END AS "favorited" 
        FROM "Article" AS a 
        INNER JOIN "User" AS u ON u."id" = a."authorId" 
        INNER JOIN "_followers" AS f ON f."A" = ${currentUserId} AND f."B" = u."id" 
        LEFT JOIN "_ArticleToTag" AS att ON att."A" = a."id" 
        LEFT JOIN "Tag" AS t ON t."id" = att."B" 
        LEFT JOIN "Like" AS l ON l."articleId" = a."id" 
        LEFT JOIN "User" AS ul ON ul."id" = l."userId" 
        ORDER BY a."created_at" DESC`;
    }

    const uniqueArticleById = [
      ...new Map(result.map((item) => [item['id'], item])).values(),
    ];

    const normalizedData = uniqueArticleById.map(
      (item) =>
        ({
          slug: item.slug,
          title: item.title,
          description: item.description,
          body: item.body,
          tagList: [
            ...new Set(
              result
                .filter((value) => value.id === item.id)
                .map((value) => value.tag_name),
            ),
          ],
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          favorited: Boolean(item.favorited),
          favoritesCount: item.favorites_count,
          author: {
            username: item.username,
            bio: item.bio,
            image: item.image,
            following: Boolean(item.following),
          },
        } as ArticleResponse),
    );

    const mapResponse = {
      articles: normalizedData,
      articlesCount: normalizedData.length,
    } as MultipleArticleResponse;

    return mapResponse;
  }

  async findOne(
    slug: string,
    currentUserId?: string,
  ): Promise<SingleArticleResponse | null> {
    console.log(slug, currentUserId);
    const curUserId = currentUserId || '';
    let process: any[] = [];
    process = await this.prisma.$queryRaw`
        SELECT 
          a."id", 
          a."slug", 
          a."title", 
          a."description", 
          a."body", 
          a."favorites_count", 
          a."created_at", 
          a."updated_at", 
          a."authorId", 
          u."username", 
          u."bio", 
          u."image", 
          CASE WHEN f."A" IS NULL THEN 0 ELSE 1 END AS "following", 
          att."B" AS "tag_id", 
          t."name" AS "tag_name", 
          l."userId" AS "liked_by", 
          ul."username" AS "liked_by_username", 
          CASE WHEN l."userId" IS NULL THEN 0 ELSE 1 END AS "favorited" 
        FROM "Article" AS a 
        INNER JOIN "User" AS u ON u."id" = a."authorId" 
        LEFT JOIN "_followers" AS f ON f."A" = ${curUserId} AND f."B" = u."id"
        LEFT JOIN "_ArticleToTag" AS att ON att."A" = a."id" 
        LEFT JOIN "Tag" AS t ON t."id" = att."B" 
        LEFT JOIN "Like" AS l ON l."articleId" = a."id" 
        LEFT JOIN "User" AS ul ON ul."id" = l."userId" 
        WHERE a."slug" = ${slug} 
        ORDER BY a."created_at" DESC`;

    const uniqueArticleById = [
      ...new Map(process.map((item) => [item['id'], item])).values(),
    ];

    const normalizedData = uniqueArticleById.map(
      (item) =>
        ({
          id: item.id,
          slug: item.slug,
          title: item.title,
          description: item.description,
          body: item.body,
          tagList: [
            ...new Set(
              process
                .filter((value) => value.id === item.id)
                .map((value) => value.tag_name),
            ),
          ],
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          favorited: Boolean(item.favorited),
          favoritesCount: item.favorites_count,
          author: {
            username: item.username,
            bio: item.bio,
            image: item.image,
            following: Boolean(item.following),
          },
        } as ArticleResponse),
    );

    const mapResponse = {
      article: normalizedData[0] || null,
    } as SingleArticleResponse;

    return mapResponse;
  }

  async update(
    params: { slug: string; authorId: string; authorUsername: string },
    updateArticleDto: UpdateArticleDto,
  ): Promise<SingleArticleResponse | null> {
    const oldArticle = await this.findOne(params.slug, params.authorId);
    if (oldArticle.article.author.username !== params.authorUsername) {
      throw new UnauthorizedException();
    }
    const {
      title: oldTitle,
      body: oldBody,
      description: oldDescription,
      slug: oldSlug,
    } = oldArticle.article;
    const {
      body: newBody,
      description: newDescription,
      title: newTitle,
    } = updateArticleDto.article;
    const body = {
      slug: (newTitle || oldTitle).trim().replace(/\s/g, '-').toLowerCase(),
      title: newTitle || oldTitle,
      body: newBody || oldBody,
      description: newDescription || oldDescription,
    };
    const process = await this.prisma.$queryRaw`UPDATE "Article" SET slug = ${
      body.slug
    }, title = ${body.title}, body = ${body.body}, "description" = ${
      body.description
    }, updated_at = ${new Date()} WHERE slug = ${oldSlug} RETURNING slug`;

    const result = await this.findOne(process[0].slug, params.authorId);

    return result;
  }

  async remove(params: {
    slug: string;
    authorId: string;
    authorUsername: string;
  }): Promise<void> {
    const oldArticle = await this.findOne(params.slug, params.authorId);
    if (oldArticle.article.author.username !== params.authorUsername) {
      throw new UnauthorizedException();
    }
    await this.prisma
      .$queryRaw`DELETE FROM "Article" WHERE slug = ${params.slug}`;
  }

  async likeArticle(
    slug: string,
    currentUserId: string,
  ): Promise<SingleArticleResponse> {
    const article = await this.findOne(slug);
    const { id, favoritesCount } = article.article;
    await this.prisma
      .$executeRaw`INSERT INTO "Like" ("userId", "articleId") VALUES (${currentUserId}, ${id})`;
    await this.prisma.$executeRaw`UPDATE "Article" SET favorites_count = ${
      favoritesCount + 1
    } WHERE id = ${id}`;
    const result = await this.findOne(slug, currentUserId);
    return result;
  }

  async unlikeArticle(
    slug: string,
    currentUserId: string,
  ): Promise<SingleArticleResponse> {
    const article = await this.findOne(slug);
    const { id, favoritesCount } = article.article;
    await this.prisma
      .$executeRaw`DELETE FROM "Like" WHERE "userId" = ${currentUserId} AND "articleId" = ${id}`;
    await this.prisma.$executeRaw`UPDATE "Article" SET favorites_count = ${
      favoritesCount - 1
    } WHERE id = ${id}`;
    const result = await this.findOne(slug, currentUserId);
    return result;
  }
}
