import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm'; 
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from './entities/course.entity';
import { Instructor } from '../instructors/entities/instructor.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    
    
    @InjectRepository(Instructor)
    private readonly instructorRepository: Repository<Instructor>,
  ) {}

  // 1. เพิ่มคอร์สใหม่
  async create(createCourseDto: any) {
    let instructors: Instructor[] = [];

  
    if (createCourseDto.instructorIds) {
      try {
        const parsedIds = JSON.parse(createCourseDto.instructorIds); 
        if (Array.isArray(parsedIds) && parsedIds.length > 0) {
        
          instructors = await this.instructorRepository.findBy({
            id: In(parsedIds),
          });
        }
      } catch (error) {
        console.error('แกะข้อมูล instructorIds ไม่สำเร็จ:', error);
      }
    }

  
    const newCourse = this.courseRepository.create({
      ...createCourseDto,
      instructors: instructors,
    });
    
    return this.courseRepository.save(newCourse);
  }

  // 2. ดึงคอร์สทั้งหมด
  findAll() {
    return this.courseRepository.find({
      relations: ['instructors'], // 🌟 สั่งให้ดึงข้อมูลครูแนบติดไปด้วย
    });
  }

  // 3. ดึงคอร์สเดียวตาม ID
  async findOne(id: string) {
    const course = await this.courseRepository.findOne({ 
      where: { id },
      relations: ['instructors'], // 🌟 สั่งให้ดึงข้อมูลครูแนบติดไปด้วย
    });
    
    if (!course) {
      throw new NotFoundException(`ไม่พบคอร์สที่มี ID: ${id}`); 
    }
    return course;
  }

  // 4. แก้ไขข้อมูลคอร์ส
  async update(id: string, updateCourseDto: any) {
    const course = await this.findOne(id); 

    // 🌟 ถ้ามีการอัปเดตรายชื่อครู
    if (updateCourseDto.instructorIds) {
      try {
        const parsedIds = JSON.parse(updateCourseDto.instructorIds);
        if (Array.isArray(parsedIds)) {
          course.instructors = await this.instructorRepository.findBy({
            id: In(parsedIds),
          });
        }
      } catch (error) {
        console.error('แกะข้อมูล instructorIds ไม่สำเร็จ:', error);
      }
    }

    // ลบ instructorIds ออกจาก DTO ก่อนเอาไปอัปเดตทับข้อมูลเดิม
    delete updateCourseDto.instructorIds;
    Object.assign(course, updateCourseDto); 
    
    return this.courseRepository.save(course);
  }

  // 5. ลบคอร์ส
  async remove(id: string) {
    const course = await this.courseRepository.findOne({ where: { id } });
    
    if (!course) {
      throw new NotFoundException(`ไม่พบคอร์สที่มี ID: ${id}`);
    }

    return this.courseRepository.remove(course);
  }
}