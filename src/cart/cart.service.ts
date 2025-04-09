import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Cart } from './entities/cart.entity'
import { CartItem } from './entities/cart-item.entity'
import { ProductsService } from '../products/products.service'
import { User } from '../users/entities/user.entity'
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto'


@Injectable()
export class CartService {
    constructor(
        @InjectRepository(Cart)
        private readonly cartRepository: Repository<Cart>,
        @InjectRepository(CartItem)
        private readonly cartItemRepository: Repository<CartItem>,
        private readonly productsService: ProductsService,
    ) { }

    async getCart(user: User): Promise<Cart> {
        let cart = await this.cartRepository.findOne({
            where: { user: { id: user.id } },
            relations: ['items', 'items.product', 'items.product.images'],
        })

        if (!cart) {
            const { role, ...userWithoutRole } = user; // Exclude role from user
            cart = this.cartRepository.create({ user: userWithoutRole })
            await this.cartRepository.save(cart)
        }

        return cart
    }

    async addToCart(user: User, addToCartDto: AddToCartDto): Promise<Cart> {
        const { productId, quantity } = addToCartDto

        // Get the product
        const product = await this.productsService.findOne(productId)

        // Check if product has enough inventory
        if (product.quantity < quantity) {
            throw new BadRequestException(`Not enough inventory. Only ${product.quantity} items available.`)
        }

        // Get or create cart
        let cart = await this.getCart(user)

        // Check if item already exists in cart
        let cartItem = cart.items.find(item => item.product.id === productId)

        if (cartItem) {
            // Update existing cart item
            if (product.quantity < cartItem.quantity + quantity) {
                throw new BadRequestException(`Not enough inventory. Only ${product.quantity} items available.`)
            }

            cartItem.quantity += quantity
            cartItem.subTotal = cartItem.quantity * cartItem.price
        } else {
            // Create new cart item
            cartItem = this.cartItemRepository.create({
                cart,
                product,
                quantity,
                price: product.price,
                subTotal: product.price * quantity
            })

            if (!cart.items) {
                cart.items = []
            }

            cart.items.push(cartItem)
        }

        // Save cart item
        await this.cartItemRepository.save(cartItem)

        // Recalculate cart subtotal
        cart.subTotal = cart.items.reduce((sum, item) => sum + Number(item.subTotal), 0)

        // Save cart
        return this.cartRepository.save(cart)
    }

    async updateCartItem(user: User, itemId: number, updateCartItemDto: UpdateCartItemDto): Promise<Cart> {
        const cart = await this.getCart(user)

        const cartItem = cart.items.find(item => item.id === itemId)
        if (!cartItem) {
            throw new NotFoundException(`Cart item with ID ${itemId} not found`)
        }

        // Check if product has enough inventory
        const product = await this.productsService.findOne(cartItem.product.id)
        if (product.quantity < updateCartItemDto.quantity) {
            throw new BadRequestException(`Not enough inventory. Only ${product.quantity} items available.`)
        }

        // Update cart item
        cartItem.quantity = updateCartItemDto.quantity
        cartItem.subTotal = cartItem.quantity * cartItem.price

        await this.cartItemRepository.save(cartItem)

        // Recalculate cart subtotal
        cart.subTotal = cart.items.reduce((sum, item) => sum + Number(item.subTotal), 0)

        return this.cartRepository.save(cart)
    }

    async removeCartItem(user: User, itemId: number): Promise<Cart> {
        const cart = await this.getCart(user)

        const cartItem = cart.items.find(item => item.id === itemId)
        if (!cartItem) {
            throw new NotFoundException(`Cart item with ID ${itemId} not found`)
        }

        // Remove cart item
        await this.cartItemRepository.remove(cartItem)

        // Refresh cart
        const updatedCart = await this.getCart(user)

        // Recalculate cart subtotal
        updatedCart.subTotal = updatedCart.items.reduce((sum, item) => sum + Number(item.subTotal), 0)

        return this.cartRepository.save(updatedCart)
    }

    async clearCart(user: User): Promise<Cart> {
        const cart = await this.getCart(user)

        // Remove all cart items
        if (cart.items && cart.items.length > 0) {
            await this.cartItemRepository.remove(cart.items)
        }

        // Reset cart
        cart.items = []
        cart.subTotal = 0

        return this.cartRepository.save(cart)
    }
}