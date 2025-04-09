import { Module } from '@nestjs/common';
import { ProductTypesService } from './product-types.service';
import { ProductTypesController } from './product-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductType } from './entities/product-type.entity';
import { SubcategoriesModule } from 'src/subcategories/subcategories.module';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductType]),
    SubcategoriesModule,
    SharedModule],
  providers: [ProductTypesService],
  controllers: [ProductTypesController],
  exports: [ProductTypesService],
})
export class ProductTypesModule { }
