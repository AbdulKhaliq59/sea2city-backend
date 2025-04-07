import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFile } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from "@nestjs/swagger"
import { CreateServiceDto } from "./dto/create-service.dto"
import { UpdateServiceDto } from "./dto/update-service.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { Role } from "../users/enums/role.enum"
import { PaginationQueryDto } from "src/shared/pagination/pagination-query.dto"
import { PaginationResponse } from "src/shared/pagination/pagination-response"
import { Service } from "./entities/service.entity"
import { ImageUploadService } from "src/shared/image-upload/image-upload.service"
import { FileInterceptor } from "@nestjs/platform-express"
import { ServicesService } from "./services.service"

@ApiTags("services")
@Controller("services")
export class ServicesController {
    constructor(
        private readonly servicesService: ServicesService,
        private readonly imageUploadService: ImageUploadService
    ) { }

    @ApiOperation({ summary: 'Create a new service with optional image (Admin only)' })
    @ApiResponse({ status: 201, description: 'Service successfully created' })
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
                title: { type: 'string' },
                description: { type: 'string' },
                image: {
                    type: 'string',
                    format: 'binary',
                },
            },
            required: ['title']
        },
    })
    async create(
        @Body() createServiceDto: CreateServiceDto,
        @UploadedFile() file: Express.Multer.File
    ) {
        let imageUrl: any = null;
        if (file) {
            imageUrl = await this.imageUploadService.uploadImage(file);
        }
        return this.servicesService.create(createServiceDto, imageUrl);
    }

    @ApiOperation({ summary: "Get all services" })
    @ApiResponse({ status: 200, description: "Return all services" })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'perPage', required: false, type: Number, description: 'Items per page' })
    @Get()
    findAll(@Query() paginationQuery: PaginationQueryDto): Promise<PaginationResponse<Service>> {
        return this.servicesService.findAll(paginationQuery.page, paginationQuery.perPage);
    }

    @ApiOperation({ summary: 'Get service by ID' })
    @ApiResponse({ status: 200, description: 'Return the service' })
    @ApiResponse({ status: 404, description: 'Service not found' })
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.servicesService.findOne(+id);
    }

    @ApiOperation({ summary: "Update service with optional image (Admin only)" })
    @ApiResponse({ status: 200, description: "Service successfully updated" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    @ApiResponse({ status: 403, description: "Forbidden" })
    @ApiResponse({ status: 404, description: "Service not found" })
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
                title: { type: 'string' },
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
        @Body() updateServiceDto: UpdateServiceDto,
        @UploadedFile() file: Express.Multer.File
    ) {
        let imageUrl: any = null;
        if (file) {
            imageUrl = await this.imageUploadService.uploadImage(file);
        }
        return this.servicesService.update(+id, updateServiceDto, imageUrl);
    }

    @ApiOperation({ summary: 'Delete service (Admin only)' })
    @ApiResponse({ status: 200, description: 'Service successfully deleted' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Service not found' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.servicesService.remove(+id);
    }
}