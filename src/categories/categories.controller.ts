import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFile } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from "@nestjs/swagger"
import { CategoriesService } from "./categories.service"
import { CreateCategoryDto } from "./dto/create-category.dto"
import { UpdateCategoryDto } from "./dto/update-category.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { Role } from "../users/enums/role.enum"
import { PaginationQueryDto } from "src/shared/pagination/pagination-query.dto"
import { PaginationResponse } from "src/shared/pagination/pagination-response"
import { Category } from "./entities/category.entity"
import { FileInterceptor } from "@nestjs/platform-express"
import { ImageUploadService } from "src/shared/image-upload/image-upload.service"

@ApiTags("categories")
@Controller("categories")
export class CategoriesController {
    constructor(
        private readonly categoriesService: CategoriesService,
        private readonly imageUploadService: ImageUploadService
    ) { }

    @ApiOperation({ summary: 'Create a new category (Admin only)' })
    @ApiOperation({ summary: 'Create a new category with optional image (Admin only)' })
    @ApiResponse({ status: 201, description: 'Category successfully created' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Post()
    @UseInterceptors(FileInterceptor('image'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                image: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    async create(
        @Body() createCategoryDto: CreateCategoryDto,
        @UploadedFile() file: Express.Multer.File
    ) {
        console.log("Received form data:", createCategoryDto);

        let imageUrl: any = null;
        if (file) {
            imageUrl = await this.imageUploadService.uploadImage(file);
        }
        return this.categoriesService.create(createCategoryDto, imageUrl);
    }

    @ApiOperation({ summary: "Get all categories" })
    @ApiResponse({ status: 200, description: "Return all categories" })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'perPage', required: false, type: Number, description: 'Items per page' })
    @Get()
    findAll(@Query() paginationQuery: PaginationQueryDto): Promise<PaginationResponse<Category>> {
        return this.categoriesService.findAll(paginationQuery.page, paginationQuery.perPage);
    }

    @ApiOperation({ summary: 'Get category by ID' })
    @ApiResponse({ status: 200, description: 'Return the category' })
    @ApiResponse({ status: 404, description: 'Category not found' })
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.categoriesService.findOne(+id);
    }

    @ApiOperation({ summary: "Update category with optional image (Admin only)" })
    @ApiResponse({ status: 200, description: "Category successfully updated" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    @ApiResponse({ status: 403, description: "Forbidden" })
    @ApiResponse({ status: 404, description: "Category not found" })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Patch(":id")
    @UseInterceptors(FileInterceptor('image'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                image: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    async update(
        @Param('id') id: string,
        @Body() updateCategoryDto: UpdateCategoryDto,
        @UploadedFile() file: Express.Multer.File
    ) {
        let imageUrl: any = null;
        if (file) {
            imageUrl = await this.imageUploadService.uploadImage(file);
        }
        return this.categoriesService.update(+id, updateCategoryDto, imageUrl);
    }

    @ApiOperation({ summary: 'Delete category (Admin only)' })
    @ApiResponse({ status: 200, description: 'Category successfully deleted' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Category not found' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.categoriesService.remove(+id);
    }
}

