import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Product } from "./entities/product.entity"
import { ProductImage } from "./entities/product-image.entity"
import { CreateProductDto } from "./dto/create-product.dto"
import { UpdateProductDto } from "./dto/update-product.dto"
import { SubcategoriesService } from "../subcategories/subcategories.service"
import { CategoriesService } from "../categories/categories.service"
import { ProductTypesService } from "../product-types/product-types.service"
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
        private categoriesService: CategoriesService,
        private productTypesService: ProductTypesService,
        private paginationService: PaginationService
    ) { }

    async create(createProductDto: CreateProductDto): Promise<Product> {
        // Get subcategory
        const subcategory = await this.subcategoriesService.findOne(createProductDto.subcategoryId);

        // If categoryId is provided, validate that subcategory belongs to the category
        if (createProductDto.categoryId) {
            const category = await this.categoriesService.findOne(createProductDto.categoryId);

            if (subcategory.category.id !== category.id) {
                throw new BadRequestException(
                    `Subcategory with ID ${createProductDto.subcategoryId} does not belong to category with ID ${createProductDto.categoryId}`
                );
            }
        }

        // Get productType if provided
        let productType: any = null;
        if (createProductDto.productTypeId) {
            productType = await this.productTypesService.findOne(createProductDto.productTypeId);
        }

        const product = this.productsRepository.create({
            name: createProductDto.name,
            price: createProductDto.price,
            quantity: createProductDto.quantity || 0,
            description: createProductDto.description,
            additionalInfo: createProductDto.additionalInfo,
            subcategory,
            productType,
        });

        console.log("Product to be saved:", product);

        const savedProduct = await this.productsRepository.save(product);

        if (createProductDto.imageUrls && createProductDto.imageUrls.length > 0) {
            const productImages = createProductDto.imageUrls.map((url) => {
                return this.productImagesRepository.create({
                    url,
                    product: savedProduct,
                });
            });

            await this.productImagesRepository.save(productImages);
            savedProduct.images = productImages;
        }

        return savedProduct;
    }

    async findAll(page: number = 1, perPage: number = 10): Promise<PaginationResponse<Product>> {
        const products = await this.productsRepository.find({
            relations: ["subcategory", "subcategory.category", "productType", "images"],
        });

        return this.paginationService.paginate(products, page, perPage);
    }

    async findOne(id: number): Promise<Product> {
        const product = await this.productsRepository.findOne({
            where: { id },
            relations: ["subcategory", "subcategory.category", "productType", "images"],
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        return product;
    }

    async findBySubcategory(subcategoryId: number, page: number = 1, perPage: number = 10): Promise<PaginationResponse<Product>> {
        const products = await this.productsRepository.find({
            where: { subcategory: { id: subcategoryId } },
            relations: ["subcategory", "subcategory.category", "images", "productType"],
        });

        return this.paginationService.paginate(products, page, perPage);
    }

    async findByCategory(categoryId: number, page: number = 1, perPage: number = 10): Promise<PaginationResponse<Product>> {
        const products = await this.productsRepository.find({
            where: { subcategory: { category: { id: categoryId } } },
            relations: ["subcategory", "subcategory.category", "images", "productType"],
        });

        return this.paginationService.paginate(products, page, perPage);
    }

    async findByProductType(productTypeId: number, page = 1, perPage = 10): Promise<PaginationResponse<Product>> {
        const products = await this.productsRepository.find({
            where: { productType: { id: productTypeId } },
            relations: ["subcategory", "subcategory.category", "images", "productType"],
        });

        return this.paginationService.paginate(products, page, perPage);
    }

    async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
        const product = await this.findOne(id);

        let subcategory = product.subcategory;
        let productType = product.productType;

        // Update subcategory if provided
        if (updateProductDto.subcategoryId) {
            subcategory = await this.subcategoriesService.findOne(updateProductDto.subcategoryId);
        }

        // If categoryId is provided, validate that subcategory belongs to the category
        if (updateProductDto.categoryId) {
            const category = await this.categoriesService.findOne(updateProductDto.categoryId);

            if (subcategory.category.id !== category.id) {
                throw new BadRequestException(
                    `Subcategory with ID ${subcategory.id} does not belong to category with ID ${updateProductDto.categoryId}`
                );
            }
        }

        // Update productType if provided
        if (updateProductDto.productTypeId) {
            productType = await this.productTypesService.findOne(updateProductDto.productTypeId);
        }

        // Update fields if provided
        if (updateProductDto.name !== undefined) product.name = updateProductDto.name;
        if (updateProductDto.price !== undefined) product.price = updateProductDto.price;
        if (updateProductDto.quantity !== undefined) product.quantity = updateProductDto.quantity;
        if (updateProductDto.description !== undefined) product.description = updateProductDto.description;
        if (updateProductDto.additionalInfo !== undefined) product.additionalInfo = updateProductDto.additionalInfo;

        // Update relationships
        product.subcategory = subcategory;
        product.productType = productType;

        const savedProduct = await this.productsRepository.save(product);

        if (updateProductDto.imageUrls && updateProductDto.imageUrls.length > 0) {
            // Remove existing images
            if (product.images && product.images.length > 0) {
                await this.productImagesRepository.remove(product.images);
            }

            // Add new images
            const productImages = updateProductDto.imageUrls.map((url) => {
                return this.productImagesRepository.create({
                    url,
                    product: savedProduct,
                });
            });

            await this.productImagesRepository.save(productImages);
            savedProduct.images = productImages;
        }

        return savedProduct;
    }

    async updateQuantity(id: number, quantity: number): Promise<Product> {
        const product = await this.findOne(id);

        product.quantity = quantity;

        return this.productsRepository.save(product);
    }

    async remove(id: number): Promise<void> {
        const product = await this.findOne(id);
        await this.productsRepository.remove(product);
    }

    async addImage(id: number, imageUrl: string): Promise<Product> {
        const product = await this.findOne(id);

        const productImage = this.productImagesRepository.create({
            url: imageUrl,
            product,
        });

        await this.productImagesRepository.save(productImage);

        if (!product.images) {
            product.images = [];
        }

        product.images.push(productImage);

        return product;
    }
}