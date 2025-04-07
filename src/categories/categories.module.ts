import { forwardRef, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { CategoriesService } from "./categories.service"
import { CategoriesController } from "./categories.controller"
import { Category } from "./entities/category.entity"
import { SubcategoriesModule } from "src/subcategories/subcategories.module"
import { SharedModule } from "src/shared/shared.module"
import { ImageUploadService } from "src/shared/image-upload/image-upload.service"

@Module({
  imports: [TypeOrmModule.forFeature([Category]),
  forwardRef(() => SubcategoriesModule),
    SharedModule,
    // ImageUploadService
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule { }

