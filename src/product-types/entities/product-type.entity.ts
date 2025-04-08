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
import { Subcategory } from "../../subcategories/entities/subcategory.entity"
import { Product } from "../../products/entities/product.entity"

@Entity("product_types")
export class ProductType {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column({ nullable: true })
    description: string

    @Column({ nullable: true })
    imageUrl: string

    @ManyToOne(
        () => Subcategory,
        (subcategory) => subcategory.productTypes,
        { onDelete: "CASCADE" },
    )
    @JoinColumn({ name: "subcategory_id" })
    subcategory: Subcategory

    @OneToMany(
        () => Product,
        (product) => product.productType,
        { cascade: true },
    )
    products: Product[]

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}
