import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';
import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { SharedModule } from 'src/shared/shared.module';
import { Product } from 'src/products/entities/product.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Brand, Product]),
        SharedModule
    ],
    controllers: [BrandsController],
    providers: [BrandsService],
    exports: [BrandsService],
})
export class BrandsModule { }
