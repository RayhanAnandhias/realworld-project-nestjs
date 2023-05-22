import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { UserLoginResponse } from 'src/users/users.response.interface';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async signIn(email: string, pass: string): Promise<any> {
    const process = await this.prisma
      .$queryRaw`SELECT id, email, username, bio, "image", "password" FROM "User" WHERE email = ${email}`;

    if (!process) throw new UnauthorizedException();

    const result = (process[0] as User) || null;

    const isPassMatch = await bcrypt.compare(pass, result.password);

    if (!isPassMatch) throw new UnauthorizedException();

    const payloadJwt = {
      email: result.email,
      username: result.username,
      sub: result.id,
    };

    const jwt = await this.jwtService.signAsync(payloadJwt);

    const resultProcess = {
      user: {
        bio: result.bio,
        email: result.email,
        image: result.image,
        username: result.username,
        token: jwt,
      },
    } as UserLoginResponse;
    return resultProcess;
  }
}
