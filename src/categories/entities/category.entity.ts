import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { Subcategory } from "../../subcategories/entities/subcategory.entity"

@Entity("categories")
export class Category {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column({ nullable: true })
    description: string

    @Column({ nullable: true })
    imageUrl: string


    @OneToMany(
        () => Subcategory,
        (subcategory) => subcategory.category,
        { cascade: true },
    )
    subcategories: Subcategory[]

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}

