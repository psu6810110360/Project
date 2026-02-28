import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { Course } from '../../courses/entities/course.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'student' })
  role: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  // 🔗 เพิ่ม { onDelete: 'CASCADE' } ตรงนี้ครับ
  @ManyToMany(() => Course, (course) => course.users, { onDelete: 'CASCADE' })
  @JoinTable({ name: 'user_courses' }) 
  courses: Course[];;
}