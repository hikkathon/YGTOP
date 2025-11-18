import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, Prisma } from 'generated/prisma';
import { PublicUserDto } from './dto/public-user.dto';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async user(userWhereUniqueInput: Prisma.UserWhereUniqueInput,
    ): Promise<User> {
        return await this.prisma.user.findUniqueOrThrow({
            where: userWhereUniqueInput
        });
    }

    async users(params: {
        page: number
        limit: number
    }): Promise<PublicUserDto[]> {
        const { page, limit } = params;
        const skip = (page - 1) * limit;
        const users = await this.prisma.user.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: 'desc'},
        });

        const publicUsers = users.map(user => {
            const { createdAt, updatedAt, tgId, ...publicDataUser } = user;

            return publicDataUser;
        });

        return publicUsers as PublicUserDto[];
    }

    async create(data: Prisma.UserCreateInput): Promise<PublicUserDto> {
        const user = await this.prisma.user.create({ 
            data
        });

        const { createdAt, updatedAt, ...publicDataUser } = user;
         
        return publicDataUser;
    }

    async update(params: {
        data: Prisma.UserUpdateInput;
        where: Prisma.UserWhereUniqueInput;
    }): Promise<PublicUserDto> {
        const { data, where } = params;
        const user = await this.prisma.user.update({
            data, where
        });

        const { createdAt, updatedAt, ...publicDataUser } = user;

        return publicDataUser;
    }

    async delete(where: Prisma.UserWhereUniqueInput): Promise<User> {
        const user = await this.prisma.user.delete({
            where
        });
        
        return user;
    }
}
