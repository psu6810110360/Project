import { Injectable, NotFoundException  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Instructor } from './entities/instructor.entity';


@Injectable()
export class InstructorsService {
  constructor(
    @InjectRepository(Instructor)
    private instructorRepository: Repository<Instructor>,
  ) {}

  
  async create(name: string, bio: string, imageUrl: string | null) {
    const newInstructor = this.instructorRepository.create({
      name,
      bio,
      imageUrl,
    });
    return await this.instructorRepository.save(newInstructor);
  }

 
  async findAll() {
    return await this.instructorRepository.find();
  }

  async findOne(id: string) {
    return await this.instructorRepository.findOne({ where: { id } });
  }

  async remove(id: string) {
    return await this.instructorRepository.delete(id);
  }
  async update(id: string, name: string, bio: string, imageUrl: string | null) {
    const instructor = await this.findOne(id);

    
    if (!instructor) {
      throw new NotFoundException(`ไม่พบประวัติครูที่มี ID: ${id}`);
    }

   
    instructor.name = name;
    instructor.bio = bio;
    
    if (imageUrl) {
      instructor.imageUrl = imageUrl;
    }
    
    return await this.instructorRepository.save(instructor);
  }
}