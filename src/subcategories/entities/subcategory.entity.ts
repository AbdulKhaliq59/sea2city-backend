import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm"
import { Category } from "../../categories/entities/category.entity"
import { Product } from "../../products/entities/product.entity"

@Entity("subcategories")
export class Subcategory {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column({ nullable: true })
    description: string

    @ManyToOne(
        () => Category,
        (category) => category.subcategories,
        { onDelete: "CASCADE" },
    )
    @JoinColumn({ name: "category_id" })
    category: Category

    @OneToMany(
        () => Product,
        (product) => product.subcategory,
        { cascade: true },
    )
    products: Product[]

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}

