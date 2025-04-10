import { forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Subcategory } from "./entities/subcategory.entity"
import type { CreateSubcategoryDto } from "./dto/create-subcategory.dto"
import type { UpdateSubcategoryDto } from "./dto/update-subcategory.dto"
import { CategoriesService } from "../categories/categories.service"
import { PaginationService } from "src/shared/pagination/pagination.service"
import { PaginationResponse } from "src/shared/pagination/pagination-response"

@Injectable()
export class SubcategoriesService {
    constructor(
        @InjectRepository(Subcategory)
        private subcategoriesRepository: Repository<Subcategory>,
        @Inject(forwardRef(() => CategoriesService))
        private categoriesService: CategoriesService,

        private paginationService: PaginationService
    ) { }

    async create(createSubcategoryDto: CreateSubcategoryDto, imageUrl?: string): Promise<Subcategory> {
        try {
            console.log('ImageURL',imageUrl);
            
            const category = await this.categoriesService.findOne(createSubcategoryDto.categoryId)

            const subcategory = this.subcategoriesRepository.create({
                ...createSubcategoryDto,
                category,
                imageUrl
            })

            return this.subcategoriesRepository.save(subcategory)
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException(`Category with ID ${createSubcategoryDto.categoryId} not found`)
            }
            throw error
        }
    }

    async findAll(page: number = 1, perPage: number = 10): Promise<PaginationResponse<Subcategory>> {
        const subcategories = await this.subcategoriesRepository.find({
            relations: ["category", "products"]
        });
        return this.paginationService.paginate(subcategories, page, perPage)
    }

    async findOne(id: number): Promise<Subcategory> {
        const subcategory = await this.subcategoriesRepository.findOne({
            where: { id },
            relations: ["category", "products"],
        })

        if (!subcategory) {
            throw new NotFoundException(`Subcategory with ID ${id} not found`)
        }

        return subcategory
    }

    async findByCategory(categoryId: number): Promise<Subcategory[]> {
        return this.subcategoriesRepository.find({
            where: { category: { id: categoryId } },
            relations: ["products"],
        })
    }

    async update(id: number, updateSubcategoryDto: UpdateSubcategoryDto, imageUrl?: string): Promise<Subcategory> {
        const subcategory = await this.findOne(id)

        if (updateSubcategoryDto.categoryId) {
            try {
                const category = await this.categoriesService.findOne(updateSubcategoryDto.categoryId)
                subcategory.category = category
            } catch (error) {
                if (error instanceof NotFoundException) {
                    throw new NotFoundException(`Category with ID ${updateSubcategoryDto.categoryId} not found`)
                }
                throw error
            }
        }

        Object.assign(subcategory, updateSubcategoryDto)

        if (imageUrl) {
            subcategory.imageUrl = imageUrl
        }

        return this.subcategoriesRepository.save(subcategory)
    }

    async remove(id: number): Promise<void> {
        const subcategory = await this.findOne(id)
        await this.subcategoriesRepository.remove(subcategory)
    }
}

