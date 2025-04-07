import { forwardRef, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { SubcategoriesService } from "./subcategories.service"
import { SubcategoriesController } from "./subcategories.controller"
import { Subcategory } from "./entities/subcategory.entity"
import { CategoriesModule } from "../categories/categories.module"
import { SharedModule } from "src/shared/shared.module"
import { ImageUploadService } from "src/shared/image-upload/image-upload.service"

@Module({
  imports: [
    TypeOrmModule.forFeature([Subcategory]),
    // ImageUploadService,
    SharedModule,
    forwardRef(() => CategoriesModule),],
  controllers: [SubcategoriesController],
  providers: [SubcategoriesService],
  exports: [SubcategoriesService],
})
export class SubcategoriesModule { }

