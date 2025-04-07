import { Injectable, ConflictException, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import * as bcrypt from "bcrypt"
import { User } from "./entities/user.entity"
import type { CreateUserDto } from "./dto/create-user.dto"
import type { UpdateUserDto } from "./dto/update-user.dto"
import { PaginationResponse } from "src/shared/pagination/pagination-response"
import { PaginationService } from "src/shared/pagination/pagination.service"

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private paginationService: PaginationService,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const existingUser = await this.findByEmail(createUserDto.email)
        if (existingUser) {
            throw new ConflictException("Email already exists")
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10)
        const user = this.usersRepository.create({
            ...createUserDto,
            password: hashedPassword,
        })

        return this.usersRepository.save(user)
    }

    async findAll(page: number = 1, perPage: number = 10): Promise<PaginationResponse<User>> {
        const users = await this.usersRepository.find();
        return this.paginationService.paginate(users, page, perPage);
    }

    async findOne(id: number): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { id } })
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`)
        }
        return user
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email } })
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findOne(id)

        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10)
        }

        Object.assign(user, updateUserDto)
        return this.usersRepository.save(user)
    }

    async remove(id: number): Promise<void> {
        const user = await this.findOne(id)
        await this.usersRepository.remove(user)
    }
}

