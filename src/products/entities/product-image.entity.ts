import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm"
import { Product } from "./product.entity"

@Entity("product_images")
export class ProductImage {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    url: string

    @ManyToOne(
        () => Product,
        (product) => product.images,
        { onDelete: "CASCADE" },
    )
    @JoinColumn({ name: "product_id" })
    product: Product

    @CreateDateColumn()
    createdAt: Date
}

