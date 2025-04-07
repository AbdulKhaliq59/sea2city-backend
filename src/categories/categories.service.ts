import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Category } from "./entities/category.entity"
import type { CreateCategoryDto } from "./dto/create-category.dto"
import type { UpdateCategoryDto } from "./dto/update-category.dto"
import { PaginationService } from "src/shared/pagination/pagination.service"
import { PaginationResponse } from "src/shared/pagination/pagination-response"

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private categoriesRepository: Repository<Category>,
        private paginationService: PaginationService
    ) { }

    async create(createCategoryDto: CreateCategoryDto, imageUrl?: string): Promise<Category> {
        const category = this.categoriesRepository.create({
            ...createCategoryDto,
            imageUrl
        })
        return this.categoriesRepository.save(category)
    }

    async findAll(page: number = 1, perPage: number = 10): Promise<PaginationResponse<Category>> {
        const categories = await this.categoriesRepository.find({
            relations: ["subcategories"],
        });

        return this.paginationService.paginate(categories, page, perPage);
    }

    async findOne(id: number): Promise<Category> {
        const category = await this.categoriesRepository.findOne({
            where: { id },
            relations: ["subcategories"],
        })

        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`)
        }

        return category
    }

    async update(id: number, updateCategoryDto: UpdateCategoryDto, imageUrl?: string): Promise<Category> {
        const category = await this.findOne(id)

        Object.assign(category, updateCategoryDto)

        if (imageUrl) {
            category.imageUrl = imageUrl
        }

        return this.categoriesRepository.save(category)
    }
    async remove(id: number): Promise<void> {
        const category = await this.findOne(id)
        await this.categoriesRepository.remove(category)
    }
}

