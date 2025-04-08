import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Product } from "./entities/product.entity"
import { ProductImage } from "./entities/product-image.entity"
import { CreateProductDto } from "./dto/create-product.dto"
import { UpdateProductDto } from "./dto/update-product.dto"
import { SubcategoriesService } from "../subcategories/subcategories.service"
import { PaginationService } from "src/shared/pagination/pagination.service"
import { PaginationResponse } from "src/shared/pagination/pagination-response"

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
        @InjectRepository(ProductImage)
        private productImagesRepository: Repository<ProductImage>,
        private subcategoriesService: SubcategoriesService,
        private paginationService: PaginationService
    ) { }

    async create(createProductDto: CreateProductDto): Promise<Product> {
        const subcategory = await this.subcategoriesService.findOne(createProductDto.subcategoryId)

        const product = this.productsRepository.create({
            name: createProductDto.name,
            price: createProductDto.price,
            description: createProductDto.description,
            additionalInfo: createProductDto.additionalInfo,
            subcategory,
        })

        console.log("Product to be saved:", product);

        const savedProduct = await this.productsRepository.save(product)

        if (createProductDto.imageUrls && createProductDto.imageUrls.length > 0) {
            const productImages = createProductDto.imageUrls.map((url) => {
                return this.productImagesRepository.create({
                    url,
                    product: savedProduct,
                })
            })

            await this.productImagesRepository.save(productImages)
            savedProduct.images = productImages
        }

        return savedProduct
    }

    async findAll(page: number = 1, perPage: number = 10): Promise<PaginationResponse<Product>> {
        const products = await this.productsRepository.find({
            relations: ["subcategory", "subcategory.category", "images"],
        });

        return this.paginationService.paginate(products, page, perPage);
    }

    async findOne(id: number): Promise<Product> {
        const product = await this.productsRepository.findOne({
            where: { id },
            relations: ["subcategory", "subcategory.category", "images"],
        })

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`)
        }

        return product
    }

    async findBySubcategory(subcategoryId: number, page: number = 1, perPage: number = 10): Promise<PaginationResponse<Product>> {
        const products = await this.productsRepository.find({
            where: { subcategory: { id: subcategoryId } },
            relations: ["images"],
        })

        return this.paginationService.paginate(products, page, perPage)
    }

    async findByProductType(productTypeId: number, page = 1, perPage = 10): Promise<PaginationResponse<Product>> {
        const products = await this.productsRepository.find({
            where: { productType: { id: productTypeId } },
            relations: ["subcategory", "images"],
        });

        return this.paginationService.paginate(products, page, perPage);
    }

    async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
        const product = await this.findOne(id)

        if (updateProductDto.subcategoryId) {
            const subcategory = await this.subcategoriesService.findOne(updateProductDto.subcategoryId)
            product.subcategory = subcategory
        }

        if (updateProductDto.name !== undefined) product.name = updateProductDto.name
        if (updateProductDto.price !== undefined) product.price = updateProductDto.price
        if (updateProductDto.description !== undefined) product.description = updateProductDto.description
        if (updateProductDto.additionalInfo !== undefined) product.additionalInfo = updateProductDto.additionalInfo

        const savedProduct = await this.productsRepository.save(product)

        if (updateProductDto.imageUrls && updateProductDto.imageUrls.length > 0) {
            // Remove existing images
            if (product.images && product.images.length > 0) {
                await this.productImagesRepository.remove(product.images)
            }

            // Add new images
            const productImages = updateProductDto.imageUrls.map((url) => {
                return this.productImagesRepository.create({
                    url,
                    product: savedProduct,
                })
            })

            await this.productImagesRepository.save(productImages)
            savedProduct.images = productImages
        }

        return savedProduct
    }

    async remove(id: number): Promise<void> {
        const product = await this.findOne(id)
        await this.productsRepository.remove(product)
    }

    async addImage(id: number, imageUrl: string): Promise<Product> {
        const product = await this.findOne(id)

        const productImage = this.productImagesRepository.create({
            url: imageUrl,
            product,
        })

        await this.productImagesRepository.save(productImage)

        if (!product.images) {
            product.images = []
        }

        product.images.push(productImage)

        return product
    }
}