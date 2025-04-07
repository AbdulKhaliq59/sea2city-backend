import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service } from './entities/service.entity';
import { PaginationResponse } from 'src/shared/pagination/pagination-response';
import { PaginationService } from 'src/shared/pagination/pagination.service';

@Injectable()
export class ServicesService {
    constructor(
        @InjectRepository(Service)
        private servicesRepository: Repository<Service>,
        private paginationService: PaginationService,
    ) { }

    async create(createServiceDto: CreateServiceDto, imageUrl: string): Promise<Service> {
        const service = this.servicesRepository.create({
            title: createServiceDto.title,
            description: createServiceDto.description,
            imageUrl: imageUrl,
        });

        return this.servicesRepository.save(service);
    }

    async findAll(page = 1, perPage = 10): Promise<PaginationResponse<Service>> {
        const services = await this.servicesRepository.find();
        return this.paginationService.paginate(services, page, perPage);
    }

    async findOne(id: number): Promise<Service> {
        const service = await this.servicesRepository.findOne({
            where: { id },
        });

        if (!service) {
            throw new NotFoundException(`Service with ID ${id} not found`);
        }

        return service;
    }

    async update(id: number, updateServiceDto: UpdateServiceDto, imageUrl: string): Promise<Service> {
        const service = await this.findOne(id);

        if (updateServiceDto.title) {
            service.title = updateServiceDto.title;
        }

        if (updateServiceDto.description !== undefined) {
            service.description = updateServiceDto.description;
        }

        if (imageUrl) {
            service.imageUrl = imageUrl;
        }

        return this.servicesRepository.save(service);
    }

    async remove(id: number): Promise<void> {
        const service = await this.findOne(id);
        await this.servicesRepository.remove(service);
    }
}