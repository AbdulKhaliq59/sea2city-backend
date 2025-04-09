import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ProductsService } from "./products.service"
import { ProductsController } from "./products.controller"
import { Product } from "./entities/product.entity"
import { ProductImage } from "./entities/product-image.entity"
import { SubcategoriesModule } from "../subcategories/subcategories.module"
import { MulterModule } from "@nestjs/platform-express"
import { SharedModule } from "src/shared/shared.module"
import { ProductTypesModule } from "src/product-types/product-types.module"
import { CategoriesModule } from "src/categories/categories.module"

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage]),
    SubcategoriesModule,
    SharedModule,
    CategoriesModule,
    ProductTypesModule,
    MulterModule.register({
      dest: "./uploads",
    }),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule { }

