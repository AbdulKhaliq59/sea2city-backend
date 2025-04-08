import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

export class CreateProductTypeDto {
    @ApiProperty({ example: "Dry Food" })
    @IsString()
    @IsNotEmpty()
    name: string

    @ApiProperty({ example: "Nutritious dry food for cats", required: false })
    @IsString()
    @IsOptional()
    description?: string

    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    subcategoryId: number
}
