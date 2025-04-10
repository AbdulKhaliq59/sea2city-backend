import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity("product_prices")
export class ProductPrice {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("decimal", { precision: 10, scale: 2 })
    price: number;

    @ManyToOne(() => Product, (product) => product.priceHistory, { onDelete: "CASCADE" })
    @JoinColumn({ name: "product_id" })
    product: Product;

    @CreateDateColumn()
    createdAt: Date;
}