// src/brands/dto/create-brand.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateBrandDto {
    @ApiProperty({ description: 'Brand name' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'Brand image URL', required: false })
    @IsOptional()
    @IsString()
    imageUrl?: string;
}