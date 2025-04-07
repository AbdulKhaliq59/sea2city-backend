import { ApiProperty } from "@nestjs/swagger"
import { IsArray, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from "class-validator"

export class CreateProductDto {
    @ApiProperty({ example: "Cat Tent" })
    @IsString()
    @IsNotEmpty()
    name: string

    @ApiProperty({ example: 29.99 })
    @IsNumber()
    @IsNotEmpty()
    price: number

    @ApiProperty({ example: ["Comfortable tent for your cat", "Easy to clean"], required: false })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    description?: string[]

    @ApiProperty({
        example: {
            colors: ["Red", "Blue", "Green"],
            sizes: ["Small", "Medium", "Large"],
        },
        required: false,
    })
    @IsObject()
    @IsOptional()
    additionalInfo?: Record<string, any>

    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    subcategoryId: number

    @ApiProperty({ example: ["https://example.com/image1.jpg"], required: false })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    imageUrls?: any[]
}

