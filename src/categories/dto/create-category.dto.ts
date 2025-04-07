import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString } from "class-validator"

export class CreateCategoryDto {
    @ApiProperty({ example: "Cat Supplies" })
    @IsString()
    @IsNotEmpty()
    name: string

    @ApiProperty({ example: "Everything your cat needs", required: false })
    @IsString()
    description?: string
}

