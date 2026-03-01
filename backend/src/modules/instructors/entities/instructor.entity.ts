import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Course } from '../../courses/entities/course.entity';

@Entity('instructors') 
export class Instructor {
  @PrimaryGeneratedColumn('uuid') 
  id: string;

  @Column()
  name: string; 

  
  @Column({ type: 'varchar', nullable: true })
  imageUrl: string | null; 

  
  @Column({ type: 'text', nullable: true })
  bio: string | null;

  
  @ManyToMany(() => Course, (course) => course.instructors)
  courses: Course[];
}