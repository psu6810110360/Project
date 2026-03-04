import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
  ) {}

  async findAll(): Promise<Student[]> {
    return this.studentRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Student> {
    const student = await this.studentRepo.findOne({ where: { id } });
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  async create(createDto: CreateStudentDto): Promise<Student> {
    const student = this.studentRepo.create(createDto);
    return this.studentRepo.save(student);
  }

  async update(id: number, updateDto: UpdateStudentDto): Promise<Student> {
    await this.studentRepo.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    return this.studentRepo.delete(id);
  }
}