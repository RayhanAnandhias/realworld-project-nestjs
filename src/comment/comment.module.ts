import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { PrismaService } from 'src/prisma.service';
import { ArticlesService } from 'src/articles/articles.service';

@Module({
  controllers: [CommentController],
  providers: [CommentService, PrismaService, ArticlesService],
})
export class CommentModule {}
