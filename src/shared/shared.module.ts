import { Module } from '@nestjs/common';
import { PaginationService } from './pagination/pagination.service';
import { ImageUploadService } from './image-upload/image-upload.service';

@Module({
    providers: [PaginationService, ImageUploadService],
    exports: [PaginationService, ImageUploadService]
})
export class SharedModule { }
