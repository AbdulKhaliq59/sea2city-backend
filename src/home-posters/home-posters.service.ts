// src/home-posters/home-posters.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateHomePosterDto } from './dto/create-home-poster.dto';
import { UpdateHomePosterDto } from './dto/update-home-poster.dto';
import { HomePoster } from './entities/home-poster.entity';
import { PaginationResponse } from 'src/shared/pagination/pagination-response';
import { PaginationService } from 'src/shared/pagination/pagination.service';

@Injectable()
export class HomePostersService {
    constructor(
        @InjectRepository(HomePoster)
        private homePostersRepository: Repository<HomePoster>,
        private paginationService: PaginationService,
    ) { }

    async create(createHomePosterDto: CreateHomePosterDto, imageUrl: string): Promise<HomePoster> {
        const poster = this.homePostersRepository.create({
            ...createHomePosterDto,
            imageUrl,
        });

        return this.homePostersRepository.save(poster);
    }

    async findAll(page = 1, perPage = 10): Promise<PaginationResponse<HomePoster>> {
        const posters = await this.homePostersRepository.find({
            order: { id: 'ASC' }, // Changed to order by ID since displayOrder is no longer present
        });
        return this.paginationService.paginate(posters, page, perPage);
    }

    async findActive(page: number = 1, perPage: number = 10): Promise<PaginationResponse<HomePoster>> {
        const activePosters = await this.homePostersRepository.find({
            where: { isActive: true },
            order: { id: 'ASC' }, // Changed to order by ID
        });
        return this.paginationService.paginate(activePosters, page, perPage);
    }

    async findOne(id: number): Promise<HomePoster> {
        const poster = await this.homePostersRepository.findOne({
            where: { id },
        });

        if (!poster) {
            throw new NotFoundException(`Home poster with ID ${id} not found`);
        }

        return poster;
    }

    async update(id: number, updateHomePosterDto: UpdateHomePosterDto, imageUrl?: string): Promise<HomePoster> {
        const poster = await this.findOne(id);

        if (updateHomePosterDto.bannerText !== undefined) { // Updated field name
            poster.bannerText = updateHomePosterDto.bannerText;
        }

        if (updateHomePosterDto.isActive !== undefined) {
            poster.isActive = updateHomePosterDto.isActive;
        }

        if (imageUrl) {
            poster.imageUrl = imageUrl;
        }

        return this.homePostersRepository.save(poster);
    }

    async remove(id: number): Promise<void> {
        const poster = await this.findOne(id);
        await this.homePostersRepository.remove(poster);
    }

    async toggleActive(id: number): Promise<HomePoster> {
        const poster = await this.findOne(id);
        poster.isActive = !poster.isActive;
        return this.homePostersRepository.save(poster);
    }
}
