import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsNumber, IsString } from "class-validator"

export class CreateSubcategoryDto {
    @ApiProperty({ example: "Bedding" })
    @IsString()
    @IsNotEmpty()
    name: string

    @ApiProperty({ example: "Comfortable bedding for your cat", required: false })
    @IsString()
    description?: string

    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    categoryId: number
}

