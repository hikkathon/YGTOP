import { IsNotEmpty, IsInt, IsString, IsOptional, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsInt()
    @IsNotEmpty()
    readonly tgId: number;

    @IsString()
    @MinLength(6)
    @IsNotEmpty()
    readonly firstName: string;

    @IsString()
    @IsOptional()
    readonly lastName: string;

    @IsString()
    @MinLength(6)
    @IsNotEmpty()
    readonly userName: string;
}