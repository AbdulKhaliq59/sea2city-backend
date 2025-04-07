import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UsersService } from "./users.service"
import { UsersController } from "./users.controller"
import { User } from "./entities/user.entity"
import { SharedModule } from "src/shared/shared.module"

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    SharedModule
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule { }

