import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm"
import { Cart } from "./cart.entity"
import { Product } from "../../products/entities/product.entity"

@Entity("cart_items")
export class CartItem {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => Cart, cart => cart.items, { onDelete: "CASCADE" })
    @JoinColumn({ name: "cart_id" })
    cart: Cart

    @ManyToOne(() => Product, product => product.cartItems)
    @JoinColumn({ name: "product_id" })
    product: Product

    @Column()
    quantity: number

    @Column({ type: "decimal", precision: 10, scale: 2 })
    price: number

    @Column({ type: "decimal", precision: 10, scale: 2 })
    subTotal: number

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}