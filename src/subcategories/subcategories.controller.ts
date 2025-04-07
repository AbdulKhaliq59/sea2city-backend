import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger"
import { SubcategoriesService } from "./subcategories.service"
import { CreateSubcategoryDto } from "./dto/create-subcategory.dto"
import { UpdateSubcategoryDto } from "./dto/update-subcategory.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { Role } from "../users/enums/role.enum"
import { PaginationQueryDto } from "src/shared/pagination/pagination-query.dto"
import { PaginationResponse } from "src/shared/pagination/pagination-response"
import { Subcategory } from "./entities/subcategory.entity"

@ApiTags("subcategories")
@Controller("subcategories")
export class SubcategoriesController {
    constructor(private readonly subcategoriesService: SubcategoriesService) { }

    @ApiOperation({ summary: 'Create a new subcategory (Admin only)' })
    @ApiResponse({ status: 201, description: 'Subcategory successfully created' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)

    @Post()
    create(@Body() createSubcategoryDto: CreateSubcategoryDto) {
        return this.subcategoriesService.create(createSubcategoryDto);
    }

    @ApiOperation({ summary: "Get all subcategories" })
    @ApiResponse({ status: 200, description: "Return all subcategories" })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'perPage', required: false, type: Number, description: 'Items per page' })
    @Get()
    findAll(@Query() paginationQuery: PaginationQueryDto): Promise<PaginationResponse<Subcategory>> {
        return this.subcategoriesService.findAll(paginationQuery.page, paginationQuery.perPage);
    }

    @ApiOperation({ summary: 'Get subcategory by ID' })
    @ApiResponse({ status: 200, description: 'Return the subcategory' })
    @ApiResponse({ status: 404, description: 'Subcategory not found' })
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.subcategoriesService.findOne(+id);
    }

    @ApiOperation({ summary: 'Get subcategories by category ID' })
    @ApiResponse({ status: 200, description: 'Return subcategories for the category' })
    @Get('category/:categoryId')
    findByCategory(@Param('categoryId') categoryId: string) {
        return this.subcategoriesService.findByCategory(+categoryId);
    }

    @ApiOperation({ summary: "Update subcategory (Admin only)" })
    @ApiResponse({ status: 200, description: "Subcategory successfully updated" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    @ApiResponse({ status: 403, description: "Forbidden" })
    @ApiResponse({ status: 404, description: "Subcategory not found" })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Patch(":id")
    update(@Param('id') id: string, @Body() updateSubcategoryDto: UpdateSubcategoryDto) {
        return this.subcategoriesService.update(+id, updateSubcategoryDto)
    }

    @ApiOperation({ summary: 'Delete subcategory (Admin only)' })
    @ApiResponse({ status: 200, description: 'Subcategory successfully deleted' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Subcategory not found' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.subcategoriesService.remove(+id);
    }
}

