import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UserCourse } from '../../users/entities/user_course.entity';


@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  shortDescription: string;

  @Column({ default: true })
  isActive: boolean;

  
  @Column('decimal', { precision: 10, scale: 2 })
  originalPrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  salePrice: number;

  @Column({ nullable: true })
  coverImageUrl: string;

  @Column({ nullable: true })
  sampleVideoUrl: string;
  
  @Column({ type: 'json', nullable: true })
  instructors: any[];


  
  @Column({ nullable: true })
  suitableFor: string; 

  @Column({ nullable: true })
  classTime: string;
  
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  price: number;

  
  @Column({ type: 'json', nullable: true })
  courseContents: any[];

  // ✅ [เพิ่มตรงนี้] สร้างคอลัมน์ใหม่สำหรับเก็บข้อมูล Array วิดีโอ
  @Column({ type: 'json', nullable: true })
  videos: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UserCourse, userCourse => userCourse.course)
  userCourses: UserCourse[];

  @Column({ type: 'int', nullable: true })
  accessDurationDays: number;

  
  
  }