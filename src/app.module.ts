import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { AuthModule } from "./auth/auth.module"
import { UsersModule } from "./users/users.module"
import { CategoriesModule } from "./categories/categories.module"
import { SubcategoriesModule } from "./subcategories/subcategories.module"
import { ProductsModule } from "./products/products.module"
import { User } from "./users/entities/user.entity"
import { Category } from "./categories/entities/category.entity"
import { Subcategory } from "./subcategories/entities/subcategory.entity"
import { Product } from "./products/entities/product.entity"
import { ProductImage } from "./products/entities/product-image.entity"
import { SharedModule } from './shared/shared.module';
import { DatabaseConnectionService } from "./config/db"
import { ServicesModule } from "./service/services.module"
import { ProductTypesModule } from './product-types/product-types.module';

import { CartModule } from './cart/cart.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { WishlistController } from './wishlist/wishlist.controller';
import { WishlistService } from './wishlist/wishlist.service';
import { CartService } from './cart/cart.service';
import { CartController } from './cart/cart.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConnectionService,
    }),
    AuthModule,
    UsersModule,
    CategoriesModule,
    SubcategoriesModule,
    ProductsModule,
    SharedModule,
    ServicesModule,
    ProductTypesModule,
    WishlistModule,
    CartModule
  ],
})
export class AppModule { }

