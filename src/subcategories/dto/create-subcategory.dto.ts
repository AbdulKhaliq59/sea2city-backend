import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator"

export class CreateSubcategoryDto {
    @ApiProperty({ example: "Bedding" })
    @IsString()
    @IsNotEmpty()
    name: string

    @ApiProperty({ example: "Comfortable bedding for your cat", required: false })
    @IsString()
    @IsOptional()
    description?: string

    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number) // Transform string to number
    categoryId: number

    @ApiProperty({ type: 'string', format: 'binary', required: false })
    @IsOptional()
    image?: any;
}

