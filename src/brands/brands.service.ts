import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './entities/brand.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PaginationService } from 'src/shared/pagination/pagination.service';
import { PaginationResponse } from 'src/shared/pagination/pagination-response';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class BrandsService {
    constructor(
        @InjectRepository(Brand)
        private brandsRepository: Repository<Brand>,
        private paginationService: PaginationService,
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
    ) { }

    async create(createBrandDto: CreateBrandDto): Promise<Brand> {
        const brand = this.brandsRepository.create(createBrandDto);
        return this.brandsRepository.save(brand);
    }

    async findAll(page: number = 1, perPage: number = 10): Promise<PaginationResponse<Brand>> {
        const brands = await this.brandsRepository.find({
            relations: ['products'],
        });

        return this.paginationService.paginate(brands, page, perPage);
    }

    async findOne(id: number): Promise<Brand> {
        const brand = await this.brandsRepository.findOne({
            where: { id },
            relations: ['products'],
        });

        if (!brand) {
            throw new NotFoundException(`Brand with ID ${id} not found`);
        }

        return brand;
    }

    async findByBrand(brandId: number, page: number = 1, perPage: number = 10): Promise<PaginationResponse<Product>> {
        const products = await this.productsRepository.find({
            where: { brand: { id: brandId } },
            relations: ["subcategory", "subcategory.category", "images", "productType", "brand"],
        });

        return this.paginationService.paginate(products, page, perPage);
    }

    async update(id: number, updateBrandDto: UpdateBrandDto): Promise<Brand> {
        const brand = await this.findOne(id);

        Object.assign(brand, updateBrandDto);

        return this.brandsRepository.save(brand);
    }

    async remove(id: number): Promise<void> {
        const brand = await this.findOne(id);
        await this.brandsRepository.remove(brand);
    }
}