// src/modules/courses/entities/course.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Order } from '../../orders/entities/order.entity'; // ✅ 1. เพิ่ม Import Order

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

  @Column({ type: 'json', nullable: true })
  courseContents: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ความสัมพันธ์เดิม (User ที่เรียนคอร์สนี้ได้แล้ว)
  @ManyToMany(() => User, (user) => user.courses, { onDelete: 'CASCADE' })
  users: User[];

  // ✅ 2. เพิ่มความสัมพันธ์ใหม่ (ประวัติการสั่งซื้อคอร์สนี้)
  @OneToMany(() => Order, (order) => order.course)
  orders: Order[];
}