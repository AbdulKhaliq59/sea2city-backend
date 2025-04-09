import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { CartService } from './cart.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { AddToCartDto, UpdateCartItemDto, CartResponseDto } from './dto/cart.dto'

@ApiTags('cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
    constructor(private readonly cartService: CartService) { }

    @ApiOperation({ summary: 'Get user cart' })
    @ApiResponse({ status: 200, description: 'Returns the user cart', type: CartResponseDto })
    @Get()
    async getCart(@Request() req) {
        return this.cartService.getCart(req.user)
    }

    @ApiOperation({ summary: 'Add product to cart' })
    @ApiResponse({ status: 201, description: 'Product added to cart', type: CartResponseDto })
    @ApiResponse({ status: 400, description: 'Bad request - not enough inventory' })
    @Post('items')
    async addToCart(
        @Request() req,
        @Body() addToCartDto: AddToCartDto,
    ) {
        return this.cartService.addToCart(req.user, addToCartDto)
    }

    @ApiOperation({ summary: 'Update cart item quantity' })
    @ApiResponse({ status: 200, description: 'Cart item updated', type: CartResponseDto })
    @ApiResponse({ status: 400, description: 'Bad request - not enough inventory' })
    @ApiResponse({ status: 404, description: 'Cart item not found' })
    @Patch('items/:id')
    async updateCartItem(
        @Request() req,
        @Param('id') id: string,
        @Body() updateCartItemDto: UpdateCartItemDto,
    ) {
        return this.cartService.updateCartItem(req.user, +id, updateCartItemDto)
    }

    @ApiOperation({ summary: 'Remove item from cart' })
    @ApiResponse({ status: 200, description: 'Cart item removed', type: CartResponseDto })
    @ApiResponse({ status: 404, description: 'Cart item not found' })
    @Delete('items/:id')
    async removeCartItem(
        @Request() req,
        @Param('id') id: string,
    ) {
        return this.cartService.removeCartItem(req.user, +id)
    }

    @ApiOperation({ summary: 'Clear cart' })
    @ApiResponse({ status: 200, description: 'Cart cleared', type: CartResponseDto })
    @Delete()
    async clearCart(@Request() req) {
        return this.cartService.clearCart(req.user)
    }
}