import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import 'dotenv/config';
import { Category } from 'src/categories/entities/category.entity';
import { ProductImage } from 'src/products/entities/product-image.entity';
import { Product } from 'src/products/entities/product.entity';
import { Subcategory } from 'src/subcategories/entities/subcategory.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class DatabaseConnectionService implements TypeOrmOptionsFactory {
    createTypeOrmOptions(
        connectionName?: string,
    ): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
        return {
            type: 'postgres',
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: {
                rejectUnauthorized: false
            },
            entities: [User, Category, Subcategory, Product, ProductImage],
            synchronize: process.env.DB_SYNC === 'true',
            dropSchema: false,
            logging: false,
        };
    }
}
