import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateHomePosterDto {
    @ApiProperty({ description: 'The banner text of the poster' })
    @IsNotEmpty()
    @IsString()
    bannerText: string;

    @ApiProperty({
        description: 'Whether the poster is active',
        default: false,
        type: Boolean
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    isActive?: boolean;
}