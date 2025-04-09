import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { WishlistItem } from 'src/wishlist/entities/wishlist-item.entity'
import { ProductsService } from '../products/products.service'
import { User } from '../users/entities/user.entity'
import { Wishlist } from 'src/wishlist/entities/wishlist.entity'
import { AddToWishlistDto } from './dto/wishlist.dto'

@Injectable()
export class WishlistService {
    constructor(
        @InjectRepository(Wishlist)
        private readonly wishlistRepository: Repository<Wishlist>,
        @InjectRepository(WishlistItem)
        private readonly wishlistItemRepository: Repository<WishlistItem>,
        private readonly productsService: ProductsService,
    ) { }

    async getWishlist(user: User): Promise<Wishlist> {
        let wishlist = await this.wishlistRepository.findOne({
            where: { user: { id: user.id } },
            relations: ['items', 'items.product', 'items.product.images'],
        })

        if (!wishlist) {
            wishlist = this.wishlistRepository.create({ user })
            await this.wishlistRepository.save(wishlist)
        }

        return wishlist
    }

    async addToWishlist(user: User, addToWishlistDto: AddToWishlistDto): Promise<Wishlist> {
        const { productId } = addToWishlistDto

        // Get the product
        const product = await this.productsService.findOne(productId)

        // Get or create wishlist
        let wishlist = await this.getWishlist(user)

        // Check if item already exists in wishlist
        const exists = wishlist.items.some(item => item.product.id === productId)

        if (exists) {
            throw new BadRequestException(`Product already in wishlist`)
        }

        // Create new wishlist item
        const wishlistItem = this.wishlistItemRepository.create({
            wishlist,
            product,
        })

        if (!wishlist.items) {
            wishlist.items = []
        }

        wishlist.items.push(wishlistItem)

        // Save wishlist item
        await this.wishlistItemRepository.save(wishlistItem)

        // Save wishlist
        return this.wishlistRepository.save(wishlist)
    }

    async removeWishlistItem(user: User, itemId: number): Promise<Wishlist> {
        const wishlist = await this.getWishlist(user)

        const wishlistItem = wishlist.items.find(item => item.id === itemId)
        if (!wishlistItem) {
            throw new NotFoundException(`Wishlist item with ID ${itemId} not found`)
        }

        // Remove wishlist item
        await this.wishlistItemRepository.remove(wishlistItem)

        // Refresh wishlist
        return this.getWishlist(user)
    }

    async moveToCart(user: User, itemId: number): Promise<void> {
        // Implementation will depend on the CartService
        // This would typically:
        // 1. Find the wishlist item
        // 2. Add the product to the cart
        // 3. Remove the item from the wishlist
        // For now, we'll just remove from wishlist
        await this.removeWishlistItem(user, itemId)
    }

    async clearWishlist(user: User): Promise<Wishlist> {
        const wishlist = await this.getWishlist(user)

        // Remove all wishlist items
        if (wishlist.items && wishlist.items.length > 0) {
            await this.wishlistItemRepository.remove(wishlist.items)
        }

        // Reset wishlist
        wishlist.items = []

        return this.wishlistRepository.save(wishlist)
    }
}