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

@ApiTags("products")
@Controller("products")
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @ApiOperation({ summary: 'Create a new product (Admin only)' })
    @ApiResponse({ status: 201, description: 'Product successfully created' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
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
        console.log("Received form data:", createProductFormDto);

        // Parse JSON fields from form data
        const productData: CreateProductDto = {
            name: createProductFormDto.name,
            price: parseFloat(createProductFormDto.price),
            subcategoryId: parseInt(createProductFormDto.subcategoryId, 10),
        };
        console.log("Parsed product data:", productData);

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
    findBySubcategory(@Param('subcategoryId') subcategoryId: string, @Query() paginationQuery: PaginationQueryDto): Promise<PaginationResponse<Product>> {
        return this.productsService.findBySubcategory(+subcategoryId, paginationQuery.page, paginationQuery.perPage);
    }

    @ApiOperation({ summary: "Update product (Admin only)" })
    @ApiResponse({ status: 200, description: "Product successfully updated" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    @ApiResponse({ status: 403, description: "Forbidden" })
    @ApiResponse({ status: 404, description: "Product not found" })
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
        // Parse JSON fields from form data
        const updateProductDto: UpdateProductDto = {};

        // Handle all possible fields
        if (updateProductFormDto.name) updateProductDto.name = updateProductFormDto.name;
        if (updateProductFormDto.price) updateProductDto.price = parseFloat(updateProductFormDto.price);
        if (updateProductFormDto.subcategoryId) updateProductDto.subcategoryId = parseInt(updateProductFormDto.subcategoryId, 10);

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

        return this.productsService.update(+id, updateProductDto);
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
            throw new BadRequestException("No file uploaded")
        }

        const imageUrl = await this.uploadFile(file);

        // Add the image URL to the product
        return this.productsService.addImage(+id, imageUrl);
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
        if (!files || files.length === 0) {
            return [];
        }

        const uploadPromises = files.map(file => this.uploadFile(file));
        return Promise.all(uploadPromises);
    }
}