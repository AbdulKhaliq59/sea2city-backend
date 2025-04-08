import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { ProductType } from "./entities/product-type.entity"
import { CreateProductTypeDto } from "./dto/create-product-type.dto"
import { SubcategoriesService } from "../subcategories/subcategories.service"
import { PaginationResponse } from "../shared/pagination/pagination-response"
import { UpdateProductTypeDto } from "./dto/update-product-type-dto"
import { PaginationService } from "src/shared/pagination/pagination.service"

@Injectable()
export class ProductTypesService {
    constructor(
        @InjectRepository(ProductType)
        private productTypesRepository: Repository<ProductType>,
        private subcategoriesService: SubcategoriesService,
        private paginationService: PaginationService,
    ) { }

    async create(createProductTypeDto: CreateProductTypeDto, imageUrl?: string): Promise<ProductType> {
        const subcategory = await this.subcategoriesService.findOne(createProductTypeDto.subcategoryId)

        const productType = this.productTypesRepository.create({
            ...createProductTypeDto,
            imageUrl,
            subcategory,
        })

        return this.productTypesRepository.save(productType)
    }

    async findAll(page = 1, perPage = 10): Promise<PaginationResponse<ProductType>> {
        const productTypes = await this.productTypesRepository.find();
        return this.paginationService.paginate(productTypes, page, perPage);
    }

    async findOne(id: number): Promise<ProductType> {
        const productType = await this.productTypesRepository.findOne({
            where: { id },
            relations: ["subcategory", "subcategory.category", "products"],
        })

        if (!productType) {
            throw new NotFoundException(`ProductType with ID ${id} not found`)
        }

        return productType
    }

    async findBySubcategory(subcategoryId: number, page = 1, perPage = 10): Promise<PaginationResponse<ProductType>> {
        const productTypes = await this.productTypesRepository.find({
            where: { subcategory: { id: subcategoryId } },
            relations: ["products"],
        });
        return this.paginationService.paginate(productTypes, page, perPage);
    }

    async update(id: number, updateProductTypeDto: UpdateProductTypeDto, imageUrl?: string): Promise<ProductType> {
        const productType = await this.findOne(id)

        if (updateProductTypeDto.subcategoryId) {
            const subcategory = await this.subcategoriesService.findOne(updateProductTypeDto.subcategoryId)
            productType.subcategory = subcategory
        }

        Object.assign(productType, updateProductTypeDto)

        if (imageUrl) {
            productType.imageUrl = imageUrl
        }

        return this.productTypesRepository.save(productType)
    }

    async remove(id: number): Promise<void> {
        const productType = await this.findOne(id)
        await this.productTypesRepository.remove(productType)
    }
}
