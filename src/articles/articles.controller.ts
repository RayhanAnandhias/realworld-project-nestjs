import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ReadArticleDto } from './dto/read-article.dto';
import { SuccessResponse } from 'src/response/response.interface';
import { AuthGuard } from 'src/auth/auth.guard';
import { Public } from 'src/public.decorator';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() createArticleDto: CreateArticleDto, @Req() req) {
    try {
      const { user } = req;
      const { sub } = user;
      const result = await this.articlesService.create(createArticleDto, sub);
      const response = {
        data: result,
        meta: {
          code: 201,
          message: 'Successfully create new record',
          method: req.method,
          status: 'Success',
          url: req.url,
        },
      } as SuccessResponse;
      return response;
    } catch (error) {
      console.error(error);
      const isHttpErrorInstance = error instanceof HttpException;
      const errorCode = isHttpErrorInstance
        ? error.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(
        {
          error: error.message,
          meta: {
            status: 'Error',
            code: errorCode,
            url: req.url,
            method: req.method,
          },
        },
        errorCode,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Get()
  async findAll(@Query() readArticleDto: ReadArticleDto, @Req() req) {
    try {
      const { user } = req;
      const { sub } = user;
      console.log(readArticleDto);
      const result = await this.articlesService.findAll(sub, readArticleDto);
      const response = {
        data: result,
        meta: {
          code: 200,
          message: 'Successfully retrieve data',
          method: req.method,
          status: 'Success',
          url: req.url,
        },
      } as SuccessResponse;
      return response;
    } catch (error) {
      const isHttpErrorInstance = error instanceof HttpException;
      const errorCode = isHttpErrorInstance
        ? error.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(
        {
          error: error.message,
          meta: {
            status: 'Error',
            code: errorCode,
            url: req.url,
            method: req.method,
          },
        },
        errorCode,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Get('feed')
  async getFeeds(@Query() readArticleDto: ReadArticleDto, @Req() req) {
    try {
      const { user } = req;
      const { sub } = user;
      console.log(readArticleDto);
      const result = await this.articlesService.getFeeds(sub, readArticleDto);
      const response = {
        data: result,
        meta: {
          code: 200,
          message: 'Successfully retrieve data',
          method: req.method,
          status: 'Success',
          url: req.url,
        },
      } as SuccessResponse;
      return response;
    } catch (error) {
      const isHttpErrorInstance = error instanceof HttpException;
      const errorCode = isHttpErrorInstance
        ? error.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(
        {
          error: error.message,
          meta: {
            status: 'Error',
            code: errorCode,
            url: req.url,
            method: req.method,
          },
        },
        errorCode,
      );
    }
  }

  @Public()
  @UseGuards(AuthGuard)
  @Get('/:slug')
  async findOne(@Param('slug') slug: string, @Req() req) {
    try {
      const result = await this.articlesService.findOne(slug, req?.user?.sub);
      const response = {
        data: result,
        meta: {
          code: 200,
          message: 'Successfully retrieve data',
          method: req.method,
          status: 'Success',
          url: req.url,
        },
      } as SuccessResponse;
      return response;
    } catch (error) {
      console.error(error);
      const isHttpErrorInstance = error instanceof HttpException;
      const errorCode = isHttpErrorInstance
        ? error.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(
        {
          error: error.message,
          meta: {
            status: 'Error',
            code: errorCode,
            url: req.url,
            method: req.method,
          },
        },
        errorCode,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Patch(':slug')
  async update(
    @Param('slug') slug: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @Req() req,
  ) {
    try {
      const { user } = req;
      const { sub, username } = user;
      const result = await this.articlesService.update(
        { authorId: sub, slug, authorUsername: username },
        updateArticleDto,
      );
      const response = {
        data: result,
        meta: {
          code: 200,
          message: 'Successfully update record',
          method: req.method,
          status: 'Success',
          url: req.url,
        },
      } as SuccessResponse;
      return response;
    } catch (error) {
      console.error(error);
      const isHttpErrorInstance = error instanceof HttpException;
      const errorCode = isHttpErrorInstance
        ? error.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(
        {
          error: error.message,
          meta: {
            status: 'Error',
            code: errorCode,
            url: req.url,
            method: req.method,
          },
        },
        errorCode,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Delete(':slug')
  async remove(@Param('slug') slug: string, @Req() req) {
    try {
      const { user } = req;
      const { sub, username } = user;
      const result = await this.articlesService.remove({
        authorId: sub,
        slug,
        authorUsername: username,
      });
      const response = {
        data: result,
        meta: {
          code: 200,
          message: 'Successfully delete record',
          method: req.method,
          status: 'Success',
          url: req.url,
        },
      } as SuccessResponse;
      return response;
    } catch (error) {
      console.error(error);
      const isHttpErrorInstance = error instanceof HttpException;
      const errorCode = isHttpErrorInstance
        ? error.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(
        {
          error: error.message,
          meta: {
            status: 'Error',
            code: errorCode,
            url: req.url,
            method: req.method,
          },
        },
        errorCode,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Post(':slug/favorite')
  async likeArticle(@Param('slug') slug: string, @Req() req) {
    try {
      const { user } = req;
      const { sub } = user;
      const result = await this.articlesService.likeArticle(slug, sub);
      const response = {
        data: result,
        meta: {
          code: 200,
          message: 'Successfully unlike article',
          method: req.method,
          status: 'Success',
          url: req.url,
        },
      } as SuccessResponse;
      return response;
    } catch (error) {
      console.error(error);
      const isHttpErrorInstance = error instanceof HttpException;
      const errorCode = isHttpErrorInstance
        ? error.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(
        {
          error: error.message,
          meta: {
            status: 'Error',
            code: errorCode,
            url: req.url,
            method: req.method,
          },
        },
        errorCode,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Delete(':slug/favorite')
  async unlikeArticle(@Param('slug') slug: string, @Req() req) {
    try {
      const { user } = req;
      const { sub } = user;
      const result = await this.articlesService.unlikeArticle(slug, sub);
      const response = {
        data: result,
        meta: {
          code: 200,
          message: 'Successfully unlike article',
          method: req.method,
          status: 'Success',
          url: req.url,
        },
      } as SuccessResponse;
      return response;
    } catch (error) {
      console.error(error);
      const isHttpErrorInstance = error instanceof HttpException;
      const errorCode = isHttpErrorInstance
        ? error.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(
        {
          error: error.message,
          meta: {
            status: 'Error',
            code: errorCode,
            url: req.url,
            method: req.method,
          },
        },
        errorCode,
      );
    }
  }
}
