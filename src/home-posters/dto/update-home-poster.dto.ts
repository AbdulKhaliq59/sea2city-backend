// src/home-posters/dto/update-home-poster.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateHomePosterDto } from './create-home-poster.dto';

export class UpdateHomePosterDto extends PartialType(CreateHomePosterDto) { }