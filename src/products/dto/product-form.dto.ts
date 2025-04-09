import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateProductFormDto {
    @ApiProperty({ example: "Cat Tent" })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: "29.99" })
    @IsString()
    @IsNotEmpty()
    price: string;

    @ApiProperty({
        example: JSON.stringify(["Comfortable tent for your cat", "Easy to clean"]),
        description: "JSON string array of descriptions",
        required: false
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        example: JSON.stringify({
            colors: ["Red", "Blue", "Green"],
            sizes: ["Small", "Medium", "Large"],
        }),
        description: "JSON object with additional information",
        required: false,
    })
    @IsString()
    @IsOptional()
    additionalInfo?: string;

    @ApiProperty({ example: "1" })
    @IsString()
    @IsOptional()
    categoryId?: string;

    @ApiProperty({ example: "1" })
    @IsString()
    @IsNotEmpty()
    subcategoryId: string;

    @ApiProperty({ example: "1", required: false })
    @IsString()
    @IsOptional()
    productTypeId?: string;

    @ApiProperty({
        type: 'array',
        items: {
            type: 'string',
            format: 'binary'
        },
        description: "Product images",
        required: false
    })
    @IsOptional()
    images?: any[];
}

export class UpdateProductFormDto {
    @ApiProperty({ example: "Cat Tent", required: false })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ example: "29.99", required: false })
    @IsString()
    @IsOptional()
    price?: string;

    @ApiProperty({
        example: JSON.stringify(["Comfortable tent for your cat", "Easy to clean"]),
        description: "JSON string array of descriptions",
        required: false
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        example: JSON.stringify({
            colors: ["Red", "Blue", "Green"],
            sizes: ["Small", "Medium", "Large"],
        }),
        description: "JSON object with additional information",
        required: false,
    })
    @IsString()
    @IsOptional()
    additionalInfo?: string;

    @ApiProperty({ example: "1", required: false })
    @IsString()
    @IsOptional()
    subcategoryId?: string;

    @ApiProperty({ example: "1", required: false })
    @IsString()
    @IsOptional()
    categoryId?: string;

    @ApiProperty({ example: "1", required: false })
    @IsString()
    @IsOptional()
    productTypeId?: string;

    @ApiProperty({
        type: 'array',
        items: {
            type: 'string',
            format: 'binary'
        },
        description: "Product images",
        required: false
    })
    @IsOptional()
    images?: any[];
}