import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User as UserModel, Prisma } from 'generated/prisma';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PublicUserDto } from './dto/public-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  async create(
    @Body() dto: CreateUserDto,
  ): Promise<PublicUserDto> {
    return this.userService.create(dto);
  }

  @Get(':uuid')
  async findOne(@Param('uuid', ParseUUIDPipe) uuid: string): Promise<UserModel | null> {
    return this.userService.user({ uuid: uuid });
  }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<PublicUserDto[]> {
    return this.userService.users({ page, limit });
  }

  @Put(':uuid')
    async update(
      @Param('uuid', ParseUUIDPipe) uuid: string,
      @Body() dto: UpdateUserDto,
    ): Promise<PublicUserDto> {
      return this.userService.update({
        where: { uuid },
        data: dto,
      });
    }

  @Delete(':uuid')
  async delete(@Param('uuid', ParseUUIDPipe) uuid: string): Promise<UserModel | null> {
    return this.userService.delete({ uuid: uuid });
  }
}
