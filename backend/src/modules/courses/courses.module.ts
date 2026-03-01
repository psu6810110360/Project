//courses.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course } from './entities/course.entity';
import { Instructor } from '../instructors/entities/instructor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course,Instructor])], 
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}