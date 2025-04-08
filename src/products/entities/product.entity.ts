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
import { ProductImage } from "./product-image.entity"
import { ProductType } from "../../product-types/entities/product-type.entity"

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column("decimal", { precision: 10, scale: 2 })
  price: number

  @Column("simple-array", { nullable: true })
  description: string[]

  @Column("json", { nullable: true })
  additionalInfo: Record<string, any>

  @ManyToOne(
    () => Subcategory,
    (subcategory) => subcategory.products,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "subcategory_id" })
  subcategory: Subcategory

  @ManyToOne(
    () => ProductType,
    (productType) => productType.products,
    { onDelete: "SET NULL", nullable: true },
  )
  @JoinColumn({ name: "product_type_id" })
  productType: ProductType

  @OneToMany(
    () => ProductImage,
    (image) => image.product,
    { cascade: true },
  )
  images: ProductImage[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
