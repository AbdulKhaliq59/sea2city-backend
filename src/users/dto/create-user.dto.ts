import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator"
import { Role } from "../enums/role.enum"

export class CreateUserDto {
    @ApiProperty({ example: "John Doe" })
    @IsString()
    @IsNotEmpty()
    name: string

    @ApiProperty({ example: "user@example.com" })
    @IsEmail()
    @IsNotEmpty()
    email: string

    @ApiProperty({ example: "password123", minLength: 6 })
    @IsString()
    @MinLength(6)
    @IsNotEmpty()
    password: string

    @ApiProperty({ enum: Role, default: Role.USER, required: false })
    @IsEnum(Role)
    @IsOptional()
    role?: Role
}

