import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm"

import { Product } from "../../products/entities/product.entity"
import { Wishlist } from "./wishlist.entity"

@Entity("wishlist_items")
export class WishlistItem {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => Wishlist, wishlist => wishlist.items, { onDelete: "CASCADE" })
    @JoinColumn({ name: "wishlist_id" })
    wishlist: Wishlist

    @ManyToOne(() => Product, product => product.wishlistItems)
    @JoinColumn({ name: "product_id" })
    product: Product

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}