import { Injectable } from '@nestjs/common';
import { User, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  UserLoginResponse,
  UserProfileResponse,
} from './users.response.interface';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async create(createUserDto: CreateUserDto): Promise<UserLoginResponse> {
    const newId = randomUUID();
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashPassword = await bcrypt.hash(createUserDto.user.password, salt);
    const process = await this.prisma
      .$queryRaw`INSERT INTO "User" (id, email, username, "password") VALUES (${newId}, ${createUserDto.user.email}, ${createUserDto.user.username}, ${hashPassword}) RETURNING id, email, username, bio, "image"`;
    const result = process[0] || null;
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

  findAll() {
    return `This action returns all users`;
  }

  async findOne(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    const process = await this.prisma
      .$queryRaw`SELECT id, email, username, bio, "image", "password" FROM "User" WHERE id = ${userWhereUniqueInput.id} OR email = ${userWhereUniqueInput.email} OR username = ${userWhereUniqueInput.username}`;
    const result = (process[0] as User) || null;
    return result;
  }

  async findProfile(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<UserProfileResponse | null> {
    const process = await this.prisma.$queryRaw`SELECT
        u.username,
        u.bio,
        u."image",
        CASE WHEN f."A" IS NULL THEN 0 ELSE 1 end as "following"
      FROM "User" AS u
      LEFT JOIN "_followers" AS f ON f."A" = ${userWhereUniqueInput.id} and f."B" = u.id
      WHERE u.username = ${userWhereUniqueInput.username};`;
    const result = process[0] || null;
    const resultProcess = {
      profile: result
        ? {
            ...result,
            following: Boolean(result.following),
          }
        : null,
    } as UserProfileResponse;
    return resultProcess;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserLoginResponse> {
    const curUser = await this.findOne({ id });
    let hashPassword = curUser.password;

    if (updateUserDto.user.password) {
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      hashPassword = await bcrypt.hash(updateUserDto.user.password, salt);
    }

    const email = updateUserDto.user.email || curUser.email;
    const username = updateUserDto.user.username || curUser.username;
    const password = hashPassword;
    const image = updateUserDto.user.image || curUser.image || null;
    const bio = updateUserDto.user.bio || curUser.bio || null;

    const process = await this.prisma
      .$queryRaw`UPDATE "User" SET email = ${email}, username = ${username}, "password" = ${password}, "image" = ${image}, bio = ${bio}, updated_at = ${new Date()} WHERE id = ${id} RETURNING id, email, username, bio, "image", updated_at`;
    const result = (process[0] as User) || null;
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

  async followService(
    currentUserId: string,
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<UserProfileResponse | null> {
    const userToBe = await this.findOne({
      username: userWhereUniqueInput.username,
    });
    const isUserFollowed = await this.prisma
      .$queryRaw`SELECT "A", "B" FROM "_followers" WHERE "A" = ${currentUserId} AND "B" = ${userToBe.id}`;
    if (!isUserFollowed[0]) {
      await this.prisma
        .$executeRaw`INSERT INTO "_followers" VALUES (${currentUserId}, ${userToBe.id})`;
    }
    const result = await this.findProfile({
      id: currentUserId,
      username: userWhereUniqueInput.username,
    });
    return result;
  }

  async unfollowService(
    currentUserId: string,
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<UserProfileResponse | null> {
    const userToBe = await this.findOne({
      username: userWhereUniqueInput.username,
    });
    await this.prisma
      .$executeRaw`DELETE FROM "_followers" WHERE "A" = ${currentUserId} AND "B" = ${userToBe.id}`;
    const result = await this.findProfile({
      id: currentUserId,
      username: userWhereUniqueInput.username,
    });
    return result;
  }
}
