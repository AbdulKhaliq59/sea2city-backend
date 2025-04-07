import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationQueryDto {
    @ApiProperty({ description: 'Page number', default: 1, required: false })
    @IsInt()
    @Min(1)
    @IsOptional()
    @Type(() => Number)
    page?: number = 1;

    @ApiProperty({ description: 'Items per page', default: 10, required: false })
    @IsInt()
    @Min(1)
    @IsOptional()
    @Type(() => Number)
    perPage?: number = 10;
}