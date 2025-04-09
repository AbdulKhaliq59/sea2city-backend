import { ApiProperty } from "@nestjs/swagger"
import { IsInt, IsNotEmpty } from "class-validator"

export class AddToWishlistDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    @IsNotEmpty()
    productId: number
}

export class WishlistResponseDto {
    id: number
    items: WishlistItemResponseDto[]
    createdAt: Date
    updatedAt: Date
}

export class WishlistItemResponseDto {
    id: number
    product: {
        id: number
        name: string
        price: number
        imageUrl?: string
    }
}