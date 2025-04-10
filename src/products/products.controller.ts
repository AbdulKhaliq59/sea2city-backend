import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    Query,
    UploadedFiles,
    NotFoundException,
} from "@nestjs/common"
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody, ApiQuery } from "@nestjs/swagger"
import { ProductsService } from "./products.service"
import { CreateProductDto } from "./dto/create-product.dto"
import { UpdateProductDto } from "./dto/update-product.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { Role } from "../users/enums/role.enum"
import axios from "axios"
import { FormData } from "formdata-node"
import { Blob } from "buffer"
import type { Express } from "express"
import { PaginationQueryDto } from "src/shared/pagination/pagination-query.dto"
import { PaginationResponse } from "src/shared/pagination/pagination-response"
import { Product } from "./entities/product.entity"
import { CreateProductFormDto, UpdateProductFormDto } from "./dto/product-form.dto"
import { CategoriesService } from "../categories/categories.service"
import { SubcategoriesService } from "../subcategories/subcategories.service"
import { ProductTypesService } from "../product-types/product-types.service"
import { BrandsService } from "src/brands/brands.service"
import { ImageUploadService } from "src/shared/image-upload/image-upload.service"

@ApiTags("products")
@Controller("products")
export class ProductsController {
    constructor(
        private readonly productsService: ProductsService,
        private readonly categoriesService: CategoriesService,
        private readonly subcategoriesService: SubcategoriesService,
        private readonly productTypesService: ProductTypesService,
        private readonly brandsService: BrandsService,
        private readonly imageUploadService: ImageUploadService
    ) { }

    @ApiOperation({ summary: 'Create a new product (Admin only)' })
    @ApiResponse({ status: 201, description: 'Product successfully created' })
    @ApiResponse({ status: 400, description: 'Bad Request - Invalid data or IDs' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Not Found - Category, Subcategory or ProductType not found' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: CreateProductFormDto })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Post()
    @UseInterceptors(FilesInterceptor('images'))
    async create(
        @Body() createProductFormDto: CreateProductFormDto,
        @UploadedFiles() files: Array<Express.Multer.File>
    ) {

        // Parse JSON fields from form data
        const productData: CreateProductDto = {
            name: createProductFormDto.name,
            price: parseFloat(createProductFormDto.price),
            quantity: parseInt(createProductFormDto.quantity, 10),
            subcategoryId: parseInt(createProductFormDto.subcategoryId, 10),
        };

        if (createProductFormDto.brandId) {
            const brandId = parseInt(createProductFormDto.brandId, 10);

            // Validate brand exists
            try {
                await this.brandsService.findOne(brandId);
            } catch (error) {
                throw new NotFoundException(`Brand with ID ${brandId} not found`);
            }

            productData.brandId = brandId;
        }
        
        // Add categoryId if provided
        if (createProductFormDto.categoryId) {
            const categoryId = parseInt(createProductFormDto.categoryId, 10);

            // Validate category exists
            try {
                await this.categoriesService.findOne(categoryId);
            } catch (error) {
                throw new NotFoundException(`Category with ID ${categoryId} not found`);
            }

            productData.categoryId = categoryId;

            // Validate that subcategory belongs to the category
            try {
                const subcategory = await this.subcategoriesService.findOne(productData.subcategoryId);
                if (subcategory.category.id !== categoryId) {
                    throw new BadRequestException(`Subcategory with ID ${productData.subcategoryId} does not belong to category with ID ${categoryId}`);
                }
            } catch (error) {
                if (error instanceof BadRequestException) {
                    throw error;
                }
                throw new NotFoundException(`Subcategory with ID ${productData.subcategoryId} not found`);
            }
        } else {
            // Validate subcategory exists even if categoryId is not provided
            try {
                await this.subcategoriesService.findOne(productData.subcategoryId);
            } catch (error) {
                throw new NotFoundException(`Subcategory with ID ${productData.subcategoryId} not found`);
            }
        }

        // Handle productTypeId if provided
        if (createProductFormDto.productTypeId) {
            const productTypeId = parseInt(createProductFormDto.productTypeId, 10);

            // Validate productType exists
            try {
                await this.productTypesService.findOne(productTypeId);
            } catch (error) {
                throw new NotFoundException(`Product Type with ID ${productTypeId} not found`);
            }

            productData.productTypeId = productTypeId;
        }

        // Handle optional fields
        if (createProductFormDto.description) {
            try {
                productData.description = JSON.parse(JSON.stringify(createProductFormDto.description));
            } catch (e) {
                console.log("error parsing description:", e);
                throw new BadRequestException('Invalid description format');
            }
        }

        if (createProductFormDto.additionalInfo) {
            try {
                productData.additionalInfo = JSON.parse(createProductFormDto.additionalInfo);
            } catch (e) {
                throw new BadRequestException('Invalid additionalInfo format');
            }
        }

        // Upload images if any
        const imageUrls = await this.uploadFiles(files);
        if (imageUrls.length > 0) {
            productData.imageUrls = imageUrls;
        }

        return this.productsService.create(productData);
    }

    @ApiOperation({ summary: "Get all products" })
    @ApiResponse({ status: 200, description: "Return all products" })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'perPage', required: false, type: Number, description: 'Items per page' })
    @Get()
    findAll(@Query() paginationQuery: PaginationQueryDto): Promise<PaginationResponse<Product>> {
        return this.productsService.findAll(paginationQuery.page, paginationQuery.perPage);
    }

    @ApiOperation({ summary: 'Get product by ID' })
    @ApiResponse({ status: 200, description: 'Return the product' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.productsService.findOne(+id);
    }

    @ApiOperation({ summary: 'Get products by subcategory ID' })
    @ApiResponse({ status: 200, description: 'Return products for the subcategory' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'perPage', required: false, type: Number, description: 'Items per page' })
    @Get('subcategory/:subcategoryId')
    async findBySubcategory(
        @Param('subcategoryId') subcategoryId: string,
        @Query() paginationQuery: PaginationQueryDto
    ): Promise<PaginationResponse<Product>> {
        const subcatId = parseInt(subcategoryId, 10);

        // Validate subcategory exists
        try {
            await this.subcategoriesService.findOne(subcatId);
        } catch (error) {
            throw new NotFoundException(`Subcategory with ID ${subcatId} not found`);
        }

        return this.productsService.findBySubcategory(subcatId, paginationQuery.page, paginationQuery.perPage);
    }

    @ApiOperation({ summary: "Get products by product type ID" })
    @ApiResponse({ status: 200, description: "Return products for the product type" })
    @ApiQuery({ name: "page", required: false, type: Number, description: "Page number" })
    @ApiQuery({ name: "perPage", required: false, type: Number, description: "Items per page" })
    @Get("product-type/:productTypeId")
    async findByProductType(
        @Param('productTypeId') productTypeId: string,
        @Query() paginationQuery: PaginationQueryDto,
    ): Promise<PaginationResponse<Product>> {
        const prodTypeId = parseInt(productTypeId, 10);

        // Validate product type exists
        try {
            await this.productTypesService.findOne(prodTypeId);
        } catch (error) {
            throw new NotFoundException(`Product Type with ID ${prodTypeId} not found`);
        }

        return this.productsService.findByProductType(prodTypeId, paginationQuery.page, paginationQuery.perPage);
    }

    @ApiOperation({ summary: 'Get products by brand ID' })
    @ApiResponse({ status: 200, description: 'Return products for the brand' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'perPage', required: false, type: Number, description: 'Items per page' })
    @Get('brand/:brandId')
    async findByBrand(
        @Param('brandId') brandId: string,
        @Query() paginationQuery: PaginationQueryDto
    ): Promise<PaginationResponse<Product>> {
        const brandIdNum = parseInt(brandId, 10);

        // Validate brand exists
        try {
            await this.brandsService.findOne(brandIdNum);
        } catch (error) {
            throw new NotFoundException(`Brand with ID ${brandIdNum} not found`);
        }

        return this.productsService.findByBrand(brandIdNum, paginationQuery.page, paginationQuery.perPage);
    }
    @ApiOperation({ summary: 'Get product price history' })
    @ApiResponse({ status: 200, description: 'Return price history for the product' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    @Get(':id/price-history')
    async getPriceHistory(@Param('id') id: string) {
        const productId = parseInt(id, 10);

        // Validate product exists
        try {
            await this.productsService.findOne(productId);
        } catch (error) {
            throw new NotFoundException(`Product with ID ${productId} not found`);
        }

        return this.productsService.getPriceHistory(productId);
    }

    @ApiOperation({ summary: "Update product (Admin only)" })
    @ApiResponse({ status: 200, description: "Product successfully updated" })
    @ApiResponse({ status: 400, description: "Bad Request - Invalid data or IDs" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    @ApiResponse({ status: 403, description: "Forbidden" })
    @ApiResponse({ status: 404, description: "Not Found - Product, Category, Subcategory, or ProductType not found" })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: UpdateProductFormDto })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Patch(":id")
    @UseInterceptors(FilesInterceptor('images'))
    async update(
        @Param('id') id: string,
        @Body() updateProductFormDto: UpdateProductFormDto,
        @UploadedFiles() files: Array<Express.Multer.File>
    ) {
        // Validate product exists
        const productId = parseInt(id, 10);
        try {
            await this.productsService.findOne(productId);
        } catch (error) {
            throw new NotFoundException(`Product with ID ${productId} not found`);
        }

        // Parse JSON fields from form data
        const updateProductDto: UpdateProductDto = {};

        // Handle all possible fields
        if (updateProductFormDto.name) updateProductDto.name = updateProductFormDto.name;
        if (updateProductFormDto.price) updateProductDto.price = parseFloat(updateProductFormDto.price);
        if (updateProductFormDto.quantity) updateProductDto.quantity = parseInt(updateProductFormDto.quantity, 10);

        // Handle categoryId if provided
        if (updateProductFormDto.categoryId) {
            const categoryId = parseInt(updateProductFormDto.categoryId, 10);

            if (updateProductFormDto.brandId) {
                const brandId = parseInt(updateProductFormDto.brandId, 10);
                try {
                    await this.brandsService.findOne(brandId);
                    updateProductDto.brandId = brandId;
                } catch (error) {
                    throw new NotFoundException(`Brand with ID ${brandId} not found`);
                }
            }
            // Validate category exists
            try {
                await this.categoriesService.findOne(categoryId);
            } catch (error) {
                throw new NotFoundException(`Category with ID ${categoryId} not found`);
            }

            updateProductDto.categoryId = categoryId;

            // If subcategoryId is also provided, validate it belongs to the category
            if (updateProductFormDto.subcategoryId) {
                const subcategoryId = parseInt(updateProductFormDto.subcategoryId, 10);
                try {
                    const subcategory = await this.subcategoriesService.findOne(subcategoryId);
                    if (subcategory.category.id !== categoryId) {
                        throw new BadRequestException(`Subcategory with ID ${subcategoryId} does not belong to category with ID ${categoryId}`);
                    }

                    updateProductDto.subcategoryId = subcategoryId;
                } catch (error) {
                    if (error instanceof BadRequestException) {
                        throw error;
                    }
                    throw new NotFoundException(`Subcategory with ID ${subcategoryId} not found`);
                }
            }
        } else if (updateProductFormDto.subcategoryId) {
            // Handle subcategoryId if provided without categoryId
            const subcategoryId = parseInt(updateProductFormDto.subcategoryId, 10);
            try {
                await this.subcategoriesService.findOne(subcategoryId);
                updateProductDto.subcategoryId = subcategoryId;
            } catch (error) {
                throw new NotFoundException(`Subcategory with ID ${subcategoryId} not found`);
            }
        }

        // Handle productTypeId if provided
        if (updateProductFormDto.productTypeId) {
            const productTypeId = parseInt(updateProductFormDto.productTypeId, 10);
            try {
                await this.productTypesService.findOne(productTypeId);
                updateProductDto.productTypeId = productTypeId;
            } catch (error) {
                throw new NotFoundException(`Product Type with ID ${productTypeId} not found`);
            }
        }

        if (updateProductFormDto.description) {
            try {
                updateProductDto.description = JSON.parse(JSON.stringify(updateProductFormDto.description));
            } catch (e) {
                throw new BadRequestException('Invalid description format');
            }
        }

        if (updateProductFormDto.additionalInfo) {
            try {
                updateProductDto.additionalInfo = JSON.parse(updateProductFormDto.additionalInfo);
            } catch (e) {
                throw new BadRequestException('Invalid additionalInfo format');
            }
        }

        // Upload new images if any
        if (files && files.length > 0) {
            const imageUrls = await this.uploadFiles(files);
            updateProductDto.imageUrls = imageUrls;
        }

        return this.productsService.update(productId, updateProductDto);
    }

    @ApiOperation({ summary: 'Update product quantity (Admin only)' })
    @ApiResponse({ status: 200, description: 'Product quantity successfully updated' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Patch(':id/quantity')
    async updateQuantity(
        @Param('id') id: string,
        @Body() updateData: { quantity: number }
    ) {
        const productId = parseInt(id, 10);

        // Validate product exists
        try {
            await this.productsService.findOne(productId);
        } catch (error) {
            throw new NotFoundException(`Product with ID ${productId} not found`);
        }

        if (updateData.quantity < 0) {
            throw new BadRequestException('Quantity cannot be negative');
        }

        return this.productsService.updateQuantity(productId, updateData.quantity);
    }

    @ApiOperation({ summary: 'Delete product (Admin only)' })
    @ApiResponse({ status: 200, description: 'Product successfully deleted' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.productsService.remove(+id);
    }

    @ApiOperation({ summary: "Upload product image (Admin only)" })
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                file: {
                    type: "string",
                    format: "binary",
                },
            },
        },
    })
    @ApiResponse({ status: 200, description: "Image successfully uploaded" })
    @ApiResponse({ status: 400, description: "Bad request" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    @ApiResponse({ status: 403, description: "Forbidden" })
    @ApiResponse({ status: 404, description: "Product not found" })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Post(":id/upload-image")
    @UseInterceptors(FileInterceptor("file"))
    async uploadImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException("No file uploaded");
        }

        // Validate product exists
        const productId = parseInt(id, 10);
        try {
            await this.productsService.findOne(productId);
        } catch (error) {
            throw new NotFoundException(`Product with ID ${productId} not found`);
        }

        const imageUrl = await this.uploadFile(file);

        // Add the image URL to the product
        return this.productsService.addImage(productId, imageUrl);
    }

    /**
     * Helper method to upload a single file to the external storage API
     */
    private async uploadFile(file: Express.Multer.File): Promise<string> {
        const formData = new FormData();
        const blob = new Blob([file.buffer], { type: file.mimetype });
        formData.append("file", blob, file.originalname);

        try {
            const response = await axios.post("https://api.storage.ishema.rw/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Basic ${Buffer.from("admin:password123").toString("base64")}`,
                },
                params: {
                    dir: "pet_shop/",
                },
            });

            return response.data.file_url;
        } catch (error) {
            throw new BadRequestException("Failed to upload image");
        }
    }

    /**
     * Helper method to upload multiple files
     */
    private async uploadFiles(files: Array<Express.Multer.File>): Promise<string[]> {
        const imageUrls : string[] = [];
        
        if(files && files.length > 0) {
            for (const file of files) {
                const imageUrl:any = await this.imageUploadService.uploadImage(file);
                imageUrls.push(imageUrl);
            }
        }        
        return imageUrls;
    }
}