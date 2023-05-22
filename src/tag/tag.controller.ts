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
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { ReadTagDTO } from './dto/read-tag.dto';
import { Request } from 'express';
import {
  ErrorResponse,
  SuccessResponse,
} from 'src/response/response.interface';

@ApiTags('tags')
@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  @ApiCreatedResponse()
  async create(
    @Body() createTagDto: CreateTagDto,
    @Req() req: Request,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const result = await this.tagService.create(createTagDto);
      const response = {
        data: result,
        meta: {
          code: 201,
          message: 'Record has been created.',
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
      const message = isHttpErrorInstance
        ? error.message
        : 'Internal Server Error';
      throw new HttpException(
        {
          error: message,
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

  @Get()
  @ApiOkResponse()
  async findAll(
    @Query() readDto: ReadTagDTO,
    @Req() req: Request,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const result = await this.tagService.findAll(readDto);
      const totalData = await this.tagService.findAllCount(readDto);
      const response = {
        data: result,
        meta: {
          total: totalData,
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
      const message = isHttpErrorInstance
        ? error.message
        : 'Internal Server Error';
      throw new HttpException(
        {
          error: message,
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

  @Get(':id')
  @ApiOkResponse()
  async findOne(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const result = await this.tagService.findOne({ id: +id });
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

  @Patch(':id')
  @ApiOkResponse()
  async update(
    @Param('id') id: string,
    @Body() updateTagDto: UpdateTagDto,
    @Req() req: Request,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const result = await this.tagService.update({
        where: { id: +id },
        data: updateTagDto,
      });
      const response = {
        data: result,
        meta: {
          code: 200,
          message: 'Successfully update data',
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
      const message = isHttpErrorInstance
        ? error.message
        : 'Internal Server Error';
      throw new HttpException(
        {
          error: message,
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

  @Delete(':id')
  @ApiOkResponse()
  async remove(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const result = await this.tagService.remove({ id: +id });
      const response = {
        data: result,
        meta: {
          code: 200,
          message: 'Successfully delete data',
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
      const message = isHttpErrorInstance
        ? error.message
        : 'Internal Server Error';
      throw new HttpException(
        {
          error: message,
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
