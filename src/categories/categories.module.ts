import { forwardRef, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { CategoriesService } from "./categories.service"
import { CategoriesController } from "./categories.controller"
import { Category } from "./entities/category.entity"
import { SubcategoriesModule } from "src/subcategories/subcategories.module"
import { SharedModule } from "src/shared/shared.module"

@Module({
  imports: [TypeOrmModule.forFeature([Category]),
  forwardRef(() => SubcategoriesModule),
    SharedModule
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule { }

