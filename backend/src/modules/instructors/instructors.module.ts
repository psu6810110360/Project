import { Module } from '@nestjs/common';
import { InstructorsService } from './instructors.service';
import { InstructorsController } from './instructors.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Instructor } from './entities/instructor.entity';

@Module({

  imports: [TypeOrmModule.forFeature([Instructor])],
  controllers: [InstructorsController],
  providers: [InstructorsService],
})
export class InstructorsModule {}