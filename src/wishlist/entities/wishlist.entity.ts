import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm"
import { User } from "../../users/entities/user.entity"
import { WishlistItem } from "./wishlist-item.entity"

@Entity("wishlists")
export class Wishlist {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user: User

    @OneToMany(() => WishlistItem, wishlistItem => wishlistItem.wishlist, { cascade: true })
    items: WishlistItem[]

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}
