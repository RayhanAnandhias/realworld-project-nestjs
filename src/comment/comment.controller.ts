import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { SuccessResponse } from 'src/response/response.interface';
import { Public } from 'src/public.decorator';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(AuthGuard)
  @Post('articles/:slug')
  async create(
    @Param('slug') slug: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req,
  ) {
    try {
      const { user } = req;
      const { sub } = user;
      const result = await this.commentService.create(
        { slug, authorId: sub },
        createCommentDto,
      );
      const response = {
        data: result,
        meta: {
          code: 200,
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

  @Public()
  @UseGuards(AuthGuard)
  @Get('articles/:slug')
  async findAll(@Param('slug') slug: string, @Req() req) {
    try {
      const userId = req?.user?.sub || null;
      const result = await this.commentService.findAll(slug, userId);
      const response = {
        data: result,
        meta: {
          code: 200,
          message: 'Successfully retrieve data record',
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
  @Delete('/:id/articles/:slug')
  async remove(
    @Param('id') id: string,
    @Param('slug') slug: string,
    @Req() req,
  ) {
    try {
      const result = await this.commentService.remove(id);
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
}
