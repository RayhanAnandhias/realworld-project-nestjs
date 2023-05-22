import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ErrorResponse,
  SuccessResponse,
} from 'src/response/response.interface';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async register(
    @Body() createUserDto: CreateUserDto,
    @Req() req: Request,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const result = await this.usersService.create(createUserDto);
      const response = {
        data: result,
        meta: {
          code: 201,
          message: 'Record has been created',
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

  @UseGuards(AuthGuard)
  @Get('user')
  async findOne(@Req() req) {
    try {
      const { user } = req;
      const result = await this.usersService.findOne({ id: user.sub });
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
  @Patch('user')
  async update(
    @Body() updateUserDto: UpdateUserDto,
    @Req() req,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const { sub: userId } = req.user;
      console.log(userId);
      const result = await this.usersService.update(userId, updateUserDto);
      const response = {
        data: result,
        meta: {
          code: 201,
          message: 'Record has been updated',
          method: req.method,
          status: 'Success',
          url: req.url,
        },
      } as SuccessResponse;
      return response;
    } catch (error) {
      console.log(error);
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
  @Get('profile/:username')
  async getProfile(
    @Param('username') username: string,
    @Req() req,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const { user } = req;
      const { sub } = user;
      const result = await this.usersService.findProfile({ id: sub, username });
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
  @Post('profile/:username/follow')
  async followUser(
    @Param('username') username: string,
    @Req() req,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const { user } = req;
      const { sub } = user;
      const result = await this.usersService.followService(sub, { username });
      const response = {
        data: result,
        meta: {
          code: 201,
          message: 'Successfully update user',
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
  @Delete('profile/:username/follow')
  async unfollowUser(
    @Param('username') username: string,
    @Req() req,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const { user } = req;
      const { sub } = user;
      const result = await this.usersService.unfollowService(sub, { username });
      const response = {
        data: result,
        meta: {
          code: 201,
          message: 'Successfully update user',
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
}
