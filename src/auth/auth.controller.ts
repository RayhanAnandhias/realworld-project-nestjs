import {
  Body,
  Controller,
  Post,
  HttpStatus,
  HttpException,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLoginDto } from 'src/users/dto/read-user.dto';
import {
  ErrorResponse,
  SuccessResponse,
} from 'src/response/response.interface';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  async login(
    @Body() userLoginDto: UserLoginDto,
    @Req() req: Request,
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const result = await this.authService.signIn(
        userLoginDto.user.email,
        userLoginDto.user.password,
      );
      const response = {
        data: result,
        meta: {
          code: 200,
          message: 'Successfully login',
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
