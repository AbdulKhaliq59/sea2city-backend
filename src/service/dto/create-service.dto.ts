import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateServiceDto {
    @ApiProperty({ description: 'The title of the service' })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiPropertyOptional({ description: 'The description of the service' })
    @IsOptional()
    @IsString()
    description?: string;
}