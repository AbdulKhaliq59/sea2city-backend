import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { WishlistItem } from './entities/wishlist-item.entity';
import { ProductsModule } from 'src/products/products.module';
import { CartModule } from 'src/cart/cart.module';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';


@Module({
    imports: [
        TypeOrmModule.forFeature([Wishlist, WishlistItem]),
        ProductsModule,
        CartModule
    ],
    controllers: [WishlistController],
    providers: [WishlistService],
    exports: [WishlistService],

})
export class WishlistModule { }
