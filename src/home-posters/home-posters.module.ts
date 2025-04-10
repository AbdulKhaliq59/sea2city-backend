import { Module } from '@nestjs/common';
import { HomePostersService } from './home-posters.service';
import { HomePostersController } from './home-posters.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomePoster } from './entities/home-poster.entity';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HomePoster]),
    SharedModule,
  ],
  providers: [HomePostersService],
  controllers: [HomePostersController],
  exports: [HomePostersService]
})
export class HomePostersModule { }
