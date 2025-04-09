import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm"
import { User } from "../../users/entities/user.entity"
import { CartItem } from "./cart-item.entity"

@Entity("carts")
export class Cart {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user: User

    @OneToMany(() => CartItem, cartItem => cartItem.cart, { cascade: true })
    items: CartItem[]

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    subTotal: number

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}