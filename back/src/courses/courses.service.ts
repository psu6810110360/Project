import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from './entities/course.entity';

@Injectable()
export class CoursesService {
  constructor(
    
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  // 1. เพิ่มคอร์สใหม่
  create(createCourseDto: CreateCourseDto) {
    const newCourse = this.courseRepository.create(createCourseDto);
    return this.courseRepository.save(newCourse);
  }

  // 2. ดึงคอร์สทั้งหมด
  findAll() {
    return this.courseRepository.find();
  }

  // 3. ดึงคอร์สเดียวตาม ID
  async findOne(id: string) {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course) {
      throw new NotFoundException(`ไม่พบคอร์สที่มี ID: ${id}`); // โยน Error 404 ถ้าหาไม่เจอ
    }
    return course;
  }

  // 4. แก้ไขข้อมูลคอร์ส
  async update(id: string, updateCourseDto: UpdateCourseDto) {
    const course = await this.findOne(id); // เช็คก่อนว่ามีคอร์สนี้ไหม
    Object.assign(course, updateCourseDto); // เอาข้อมูลใหม่ไปทับข้อมูลเดิม
    return this.courseRepository.save(course);
  }

  // 5. ลบคอร์ส
  async remove(id: string) {
    const course = await this.findOne(id); // เช็คก่อนว่ามีให้ลบไหม
    return this.courseRepository.remove(course);
  }
}