// src/home-posters/home-posters.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFile, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { CreateHomePosterDto } from './dto/create-home-poster.dto';
import { UpdateHomePosterDto } from './dto/update-home-poster.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { PaginationQueryDto } from 'src/shared/pagination/pagination-query.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { HomePostersService } from './home-posters.service';
import { ImageUploadService } from 'src/shared/image-upload/image-upload.service';
import { HomePoster } from './entities/home-poster.entity';

@ApiTags('home-posters')
@Controller('home-posters')
export class HomePostersController {
    constructor(
        private readonly homePostersService: HomePostersService,
        private readonly imageUploadService: ImageUploadService,
    ) { }

    @ApiOperation({ summary: 'Create a new home poster with image (Admin only)' })
    @ApiResponse({ status: 201, description: 'Poster successfully created' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
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
                bannerText: { type: 'string' },
                isActive: { type: 'boolean', description: 'Must be "true" or "false" as string' },
                image: {
                    type: 'string',
                    format: 'binary',
                },
            },
            required: ['bannerText', 'isActive', 'image']
        },
    })
    async create(
        @Body() createHomePosterDto: CreateHomePosterDto,
        @UploadedFile() file: Express.Multer.File,
    ) {
        let imageUrl: any = null;
        if (file) {
            imageUrl = await this.imageUploadService.uploadImage(file);
        }
        return this.homePostersService.create(createHomePosterDto, imageUrl);
    }

    @ApiOperation({ summary: 'Get all home posters (paginated)' })
    @ApiResponse({ status: 200, description: 'Return all posters' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'perPage', required: false, type: Number, description: 'Items per page' })
    @Get()
    findAll(@Query() paginationQuery: PaginationQueryDto) {
        return this.homePostersService.findAll(paginationQuery.page, paginationQuery.perPage);
    }

    @ApiOperation({ summary: 'Get all active home posters' })
    @ApiResponse({ status: 200, description: 'Return all active posters' })
    @Get('active')
    findActive() {
        return this.homePostersService.findActive();
    }

    @ApiOperation({ summary: 'Get home poster by ID' })
    @ApiResponse({ status: 200, description: 'Return the poster' })
    @ApiResponse({ status: 404, description: 'Poster not found' })
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.homePostersService.findOne(+id);
    }

    @ApiOperation({ summary: 'Update home poster with optional image (Admin only)' })
    @ApiResponse({ status: 200, description: 'Poster successfully updated' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Poster not found' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Patch(':id')
    @UseInterceptors(FileInterceptor('image'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                bannerText: { type: 'string' },
                isActive: { type: 'boolean' },
                image: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    async update(
        @Param('id') id: string,
        @Body() updateHomePosterDto: UpdateHomePosterDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        let imageUrl: any = null;
        if (file) {
            imageUrl = await this.imageUploadService.uploadImage(file);
        }
        return this.homePostersService.update(+id, updateHomePosterDto, imageUrl);
    }

    @ApiOperation({ summary: 'Delete home poster (Admin only)' })
    @ApiResponse({ status: 200, description: 'Poster successfully deleted' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Poster not found' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.homePostersService.remove(+id);
    }
    @ApiOperation({ summary: 'Toggle poster active status (Admin only)' })
    @ApiResponse({
        status: 200,
        description: 'Poster active status toggled successfully',
        type: HomePoster
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Poster not found' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Put(':id/toggle-active')
    async toggleActive(@Param('id') id: string) {
        return this.homePostersService.toggleActive(+id);
    }
}
