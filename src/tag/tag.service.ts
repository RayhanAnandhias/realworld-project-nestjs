import { Injectable } from '@nestjs/common';
import { Tag, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { ReadTagDTO, TagsResponse } from './dto/read-tag.dto';

@Injectable()
export class TagService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.TagCreateInput): Promise<Tag> {
    const result = await this.prisma
      .$queryRaw<Tag>`INSERT INTO "Tag" (name) VALUES (${data.name}) RETURNING id, "name", created_at`;

    return result;
  }

  async findAll(query: ReadTagDTO): Promise<TagsResponse> {
    const { page, limit, orderBy, sort, name } = query;
    const keyword = name || '';
    const filterName = '%' + keyword + '%';
    let offset = 0;
    const isPagination =
      page !== null &&
      page !== undefined &&
      limit !== null &&
      limit !== undefined;

    if (isPagination) {
      offset = Number(limit) * Number(page) - Number(limit);
    }
    let defaultOrder = 'id';

    if (orderBy) {
      defaultOrder = orderBy;
    }

    let defaultSort = false;
    if (sort?.toLowerCase() === 'desc') {
      defaultSort = true;
    }

    let result: Tag[] = [];
    if (defaultSort) {
      if (isPagination) {
        result = await this.prisma
          .$queryRaw`SELECT id, "name" FROM "Tag" WHERE name ILIKE ${filterName} ORDER BY (CASE WHEN ${defaultOrder} = 'id' THEN id END) DESC, (CASE WHEN ${defaultOrder} = 'name' THEN "name" END) DESC LIMIT ${Number(
          limit,
        )} OFFSET ${offset}`;
      } else {
        result = await this.prisma
          .$queryRaw`SELECT id, "name" FROM "Tag" WHERE name ILIKE ${filterName} ORDER BY (CASE WHEN ${defaultOrder} = 'id' THEN id END) DESC, (CASE WHEN ${defaultOrder} = 'name' THEN "name" END) DESC`;
      }
    } else {
      if (isPagination) {
        result = await this.prisma
          .$queryRaw`SELECT id, "name" FROM "Tag" WHERE name ILIKE ${filterName} ORDER BY (CASE WHEN ${defaultOrder} = 'id' THEN id END) ASC, (CASE WHEN ${defaultOrder} = 'name' THEN "name" END) ASC LIMIT ${Number(
          limit,
        )} OFFSET ${offset}`;
      } else {
        result = await this.prisma
          .$queryRaw`SELECT id, "name" FROM "Tag" WHERE name ILIKE ${filterName} ORDER BY (CASE WHEN ${defaultOrder} = 'id' THEN id END) ASC, (CASE WHEN ${defaultOrder} = 'name' THEN "name" END) ASC`;
      }
    }

    const normalized = {
      tags: result.map((item) => item.name),
    } as TagsResponse;

    return normalized;
  }

  async findAllCount(query: ReadTagDTO): Promise<number> {
    const { name } = query;
    const keyword = name || '';
    const filterName = '%' + keyword + '%';

    const totalData = await this.prisma
      .$queryRaw`SELECT COUNT(*)::integer FROM "Tag" WHERE name ILIKE ${filterName}`;

    const result = totalData[0].count as number;

    return result;
  }

  async findOne(
    TagWhereUniqueInput: Prisma.TagWhereUniqueInput,
  ): Promise<Tag | null> {
    const process = await this.prisma
      .$queryRaw`SELECT id, name FROM "Tag" WHERE id = ${TagWhereUniqueInput.id}`;
    const result = (process[0] as Tag) || null;
    return result;
  }

  async update(params: {
    where: Prisma.TagWhereUniqueInput;
    data: Prisma.TagUpdateInput;
  }): Promise<Tag> {
    const { where, data } = params;
    const process = await this.prisma.$queryRaw`UPDATE "Tag" SET "name" = ${
      data.name
    }, updated_at = ${new Date()} WHERE id = ${
      where.id
    } RETURNING id, "name", updated_at`;
    const result = (process[0] as Tag) || null;
    return result;
  }

  async remove(TagWhereUniqueInput: Prisma.TagWhereUniqueInput): Promise<Tag> {
    const process = await this.prisma
      .$queryRaw`DELETE FROM "Tag" WHERE id = ${TagWhereUniqueInput.id} RETURNING id, "name"`;
    const result = (process[0] as Tag) || null;
    return result;
  }
}
