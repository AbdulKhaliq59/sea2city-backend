import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from 'src/products/entities/product.entity';
import { ProductsModule } from 'src/products/products.module';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Cart, CartItem]),
        ProductsModule,
    ],
    controllers: [CartController],
    providers: [CartService],
    exports: [CartService],
})
export class CartModule { }
