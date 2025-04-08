import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
    UseInterceptors,
    UploadedFile,
} from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from "@nestjs/swagger"
import { ProductTypesService } from "./product-types.service"
import { CreateProductTypeDto } from "./dto/create-product-type.dto"
import { UpdateProductTypeDto } from "./dto/update-product-type-dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { Role } from "../users/enums/role.enum"
import { PaginationQueryDto } from "../shared/pagination/pagination-query.dto"
import { PaginationResponse } from "../shared/pagination/pagination-response"
import { ProductType } from "./entities/product-type.entity"
import { ImageUploadService } from "../shared/image-upload/image-upload.service"
import { FileInterceptor } from "@nestjs/platform-express"
import { CreateProductTypeFormDto, UpdateProductTypeFormDto } from "./dto/product-type-form.dto"
import type { Express } from "express"

@ApiTags("product-types")
@Controller("product-types")
export class ProductTypesController {
    constructor(
        private readonly productTypesService: ProductTypesService,
        private readonly imageUploadService: ImageUploadService,
    ) { }

    @ApiOperation({ summary: "Create a new product type with optional image (Admin only)" })
    @ApiResponse({ status: 201, description: "Product type successfully created" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    @ApiResponse({ status: 403, description: "Forbidden" })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Post()
    @UseInterceptors(FileInterceptor("image"))
    @ApiConsumes("multipart/form-data")
    @ApiBody({ type: CreateProductTypeFormDto })
    async create(@Body() createProductTypeFormDto: CreateProductTypeFormDto, @UploadedFile() file: Express.Multer.File) {
        console.log("Received form data:", createProductTypeFormDto)

        const createProductTypeDto: CreateProductTypeDto = {
            name: createProductTypeFormDto.name,
            description: createProductTypeFormDto.description,
            subcategoryId: Number.parseInt(createProductTypeFormDto.subcategoryId, 10),
        }

        let imageUrl: any = null
        if (file) {
            imageUrl = await this.imageUploadService.uploadImage(file)
        }

        return this.productTypesService.create(createProductTypeDto, imageUrl)
    }

    @ApiOperation({ summary: "Get all product types" })
    @ApiResponse({ status: 200, description: "Return all product types" })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'perPage', required: false, type: Number, description: 'Items per page' })
    @Get()
    findAll(@Query() paginationQuery: PaginationQueryDto): Promise<PaginationResponse<ProductType>> {
        return this.productTypesService.findAll(paginationQuery.page, paginationQuery.perPage)
    }

    @ApiOperation({ summary: 'Get product type by ID' })
    @ApiResponse({ status: 200, description: 'Return the product type' })
    @ApiResponse({ status: 404, description: 'Product type not found' })
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.productTypesService.findOne(+id)
    }

    @ApiOperation({ summary: "Get product types by subcategory ID" })
    @ApiResponse({ status: 200, description: "Return product types for the subcategory" })
    @ApiQuery({ name: "page", required: false, type: Number, description: "Page number" })
    @ApiQuery({ name: "perPage", required: false, type: Number, description: "Items per page" })
    @Get("subcategory/:subcategoryId")
    findBySubcategory(
        @Param('subcategoryId') subcategoryId: string,
        @Query() paginationQuery: PaginationQueryDto,
    ): Promise<PaginationResponse<ProductType>> {
        return this.productTypesService.findBySubcategory(+subcategoryId, paginationQuery.page, paginationQuery.perPage)
    }

    @ApiOperation({ summary: "Update product type with optional image (Admin only)" })
    @ApiResponse({ status: 200, description: "Product type successfully updated" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    @ApiResponse({ status: 403, description: "Forbidden" })
    @ApiResponse({ status: 404, description: "Product type not found" })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Patch(":id")
    @UseInterceptors(FileInterceptor("image"))
    @ApiConsumes("multipart/form-data")
    @ApiBody({ type: UpdateProductTypeFormDto })
    async update(
        @Param('id') id: string,
        @Body() updateProductTypeFormDto: UpdateProductTypeFormDto,
        @UploadedFile() file: Express.Multer.File,
    ) {
        const updateProductTypeDto: UpdateProductTypeDto = {}

        if (updateProductTypeFormDto.name) updateProductTypeDto.name = updateProductTypeFormDto.name
        if (updateProductTypeFormDto.description) updateProductTypeDto.description = updateProductTypeFormDto.description
        if (updateProductTypeFormDto.subcategoryId) {
            updateProductTypeDto.subcategoryId = Number.parseInt(updateProductTypeFormDto.subcategoryId, 10)
        }

        let imageUrl: any = null
        if (file) {
            imageUrl = await this.imageUploadService.uploadImage(file)
        }

        return this.productTypesService.update(+id, updateProductTypeDto, imageUrl)
    }

    @ApiOperation({ summary: 'Delete product type (Admin only)' })
    @ApiResponse({ status: 200, description: 'Product type successfully deleted' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Product type not found' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.productTypesService.remove(+id)
    }
}
