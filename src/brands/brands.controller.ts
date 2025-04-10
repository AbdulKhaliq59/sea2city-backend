// src/brands/brands.controller.ts
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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import axios from 'axios';
import { FormData } from 'formdata-node';
import { Blob } from 'buffer';
import type { Express } from 'express';
import { ImageUploadService } from 'src/shared/image-upload/image-upload.service';

@ApiTags('brands')
@Controller('brands')
export class BrandsController {
    constructor(private readonly brandsService: BrandsService,
        private readonly imageUploadService: ImageUploadService
    ) { }

    @ApiOperation({ summary: 'Create a new brand with image (Admin only)' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                image: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Brand successfully created' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Post()
    @UseInterceptors(FileInterceptor('image'))
    async create(
        @Body() createBrandDto: CreateBrandDto,
        @UploadedFile() file: Express.Multer.File,
    ) {

        let imageUrl: any = null;
        if (file) {
            imageUrl = await this.imageUploadService.uploadImage(file);
        }
        // Add the image URL to the brand data
        const brandData = { ...createBrandDto, imageUrl };

        return this.brandsService.create(brandData);
    }

    @ApiOperation({ summary: 'Get all brands' })
    @ApiResponse({ status: 200, description: 'Return all brands' })
    @Get()
    findAll() {
        return this.brandsService.findAll();
    }

    @ApiOperation({ summary: 'Get brand by ID' })
    @ApiResponse({ status: 200, description: 'Return the brand' })
    @ApiResponse({ status: 404, description: 'Brand not found' })
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.brandsService.findOne(+id);
    }

    @ApiOperation({ summary: 'Update brand (Admin only)' })
    @ApiResponse({ status: 200, description: 'Brand successfully updated' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Brand not found' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto) {
        return this.brandsService.update(+id, updateBrandDto);
    }

    @ApiOperation({ summary: 'Delete brand (Admin only)' })
    @ApiResponse({ status: 200, description: 'Brand successfully deleted' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Brand not found' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.brandsService.remove(+id);
    }

    @ApiOperation({ summary: 'Upload brand image (Admin only)' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Image successfully uploaded' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Brand not found' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Post(':id/upload-image')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        // Validate brand exists
        const brandId = parseInt(id, 10);
        await this.brandsService.findOne(brandId);

        const imageUrl = await this.uploadFile(file);

        // Update the brand with the new image URL
        return this.brandsService.update(brandId, { imageUrl });
    }

    /**
     * Helper method to upload a file to the external storage API
     */
    private async uploadFile(file: Express.Multer.File): Promise<string> {
        const formData = new FormData();
        const blob = new Blob([file.buffer], { type: file.mimetype });
        formData.append('file', blob, file.originalname);

        try {
            const response = await axios.post('https://api.storage.ishema.rw/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Basic ${Buffer.from('admin:password123').toString('base64')}`,
                },
                params: {
                    dir: 'pet_shop/brands/',
                },
            });

            return response.data.file_url;
        } catch (error) {
            throw new BadRequestException('Failed to upload image');
        }
    }
}