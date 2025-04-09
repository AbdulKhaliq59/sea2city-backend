import { ApiProperty } from "@nestjs/swagger"
import { IsInt, IsNotEmpty, Min } from "class-validator"

export class AddToCartDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    @IsNotEmpty()
    productId: number

    @ApiProperty({ example: 2 })
    @IsInt()
    @Min(1)
    @IsNotEmpty()
    quantity: number
}

export class UpdateCartItemDto {
    @ApiProperty({ example: 3 })
    @IsInt()
    @Min(1)
    @IsNotEmpty()
    quantity: number
}

export class CartResponseDto {
    id: number
    items: CartItemResponseDto[]
    subTotal: number
    createdAt: Date
    updatedAt: Date
}

export class CartItemResponseDto {
    id: number
    product: {
        id: number
        name: string
        price: number
        imageUrl?: string
    }
    quantity: number
    price: number
    subTotal: number
}