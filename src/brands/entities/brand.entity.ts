// src/brands/entities/brand.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Product } from "../../products/entities/product.entity";

@Entity("brands")
export class Brand {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    imageUrl: string;

    @OneToMany(() => Product, (product) => product.brand)
    products: Product[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}