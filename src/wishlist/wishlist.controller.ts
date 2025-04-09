import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    UseGuards,
    Request,
    BadRequestException,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { WishlistService } from './wishlist.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { AddToWishlistDto, WishlistResponseDto } from './dto/wishlist.dto'
import { CartService } from '../cart/cart.service'

@ApiTags('wishlist')
@Controller('wishlist')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WishlistController {
    constructor(
        private readonly wishlistService: WishlistService,
        private readonly cartService: CartService,
    ) { }

    @ApiOperation({ summary: 'Get user wishlist' })
    @ApiResponse({ status: 200, description: 'Returns the user wishlist', type: WishlistResponseDto })
    @Get()
    async getWishlist(@Request() req) {
        return this.wishlistService.getWishlist(req.user)
    }

    @ApiOperation({ summary: 'Add product to wishlist' })
    @ApiResponse({ status: 201, description: 'Product added to wishlist', type: WishlistResponseDto })
    @ApiResponse({ status: 400, description: 'Bad request - product already in wishlist' })
    @Post('items')
    async addToWishlist(
        @Request() req,
        @Body() addToWishlistDto: AddToWishlistDto,
    ) {
        return this.wishlistService.addToWishlist(req.user, addToWishlistDto)
    }

    @ApiOperation({ summary: 'Remove item from wishlist' })
    @ApiResponse({ status: 200, description: 'Wishlist item removed', type: WishlistResponseDto })
    @ApiResponse({ status: 404, description: 'Wishlist item not found' })
    @Delete('items/:id')
    async removeWishlistItem(
        @Request() req,
        @Param('id') id: string,
    ) {
        return this.wishlistService.removeWishlistItem(req.user, +id)
    }

    @ApiOperation({ summary: 'Move item from wishlist to cart' })
    @ApiResponse({ status: 200, description: 'Item moved to cart' })
    @ApiResponse({ status: 404, description: 'Wishlist item not found' })
    @Post('items/:id/move-to-cart')
    async moveToCart(
        @Request() req,
        @Param('id') id: string,
    ) {
        const wishlist = await this.wishlistService.getWishlist(req.user)
        const wishlistItem = wishlist.items.find(item => item.id === +id)

        if (!wishlistItem) {
            throw new BadRequestException(`Wishlist item with ID ${id} not found`)
        }

        // Add to cart
        await this.cartService.addToCart(req.user, {
            productId: wishlistItem.product.id,
            quantity: 1
        })
        // Remove from wishlist
        await this.wishlistService.removeWishlistItem(req.user, +id)

        return { message: 'Item successfully moved to cart' }
    }

    @ApiOperation({ summary: 'Clear wishlist' })
    @ApiResponse({ status: 200, description: 'Wishlist cleared', type: WishlistResponseDto })
    @Delete()
    async clearWishlist(@Request() req) {
        return this.wishlistService.clearWishlist(req.user)
    }
}