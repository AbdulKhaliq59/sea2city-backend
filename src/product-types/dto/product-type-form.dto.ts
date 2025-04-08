import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsOptional, IsString } from "class-validator"

export class CreateProductTypeFormDto {
    @ApiProperty({ example: "Dry Food" })
    @IsString()
    @IsNotEmpty()
    name: string

    @ApiProperty({ example: "Nutritious dry food for cats", required: false })
    @IsString()
    @IsOptional()
    description?: string

    @ApiProperty({ example: "1" })
    @IsString()
    @IsNotEmpty()
    subcategoryId: string

    @ApiProperty({ type: "string", format: "binary", required: false })
    @IsOptional()
    image?: any
}

export class UpdateProductTypeFormDto {
    @ApiProperty({ example: "Dry Food", required: false })
    @IsString()
    @IsOptional()
    name?: string

    @ApiProperty({ example: "Nutritious dry food for cats", required: false })
    @IsString()
    @IsOptional()
    description?: string

    @ApiProperty({ example: "1", required: false })
    @IsString()
    @IsOptional()
    subcategoryId?: string

    @ApiProperty({ type: "string", format: "binary", required: false })
    @IsOptional()
    image?: any
}
