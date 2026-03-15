// user_course.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Course } from '../../courses/entities/course.entity';

@Entity('user_courses')
export class UserCourse {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.userCourses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Course, course => course.userCourses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null; // วันที่คอร์สหมดอายุ

  @Column({ default: false })
  isExtensionRequested: boolean; // เอาไว้เช็คว่าผู้ใช้กดปุ่ม "ขอต่ออายุ" หรือยัง
}