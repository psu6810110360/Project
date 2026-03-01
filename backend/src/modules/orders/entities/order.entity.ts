// src/modules/orders/entities/order.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';

// กำหนดสถานะที่เป็นไปได้
export enum OrderStatus {
  PENDING = 'PENDING',   // รอตรวจสอบ
  APPROVED = 'APPROVED', // อนุมัติแล้ว (เข้าเรียนได้)
  REJECTED = 'REJECTED', // ปฏิเสธ (สลิปไม่ผ่าน)
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  // เก็บ URL ของรูปสลิปที่อัปโหลด
  @Column()
  slipUrl: string;

  // เก็บราคาทึ่ซื้อ ณ ตอนนั้น (เผื่ออนาคตราคาคอร์สเปลี่ยน เราจะได้รู้ยอดจริง)
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  // สถานะการสั่งซื้อ (Default คือ รอตรวจสอบ)
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // เชื่อมกับ User (User 1 คน มีได้หลาย Order)
  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // เชื่อมกับ Course (Course 1 คอร์ส มีได้หลาย Order)
  @ManyToOne(() => Course, (course) => course.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course: Course;
}
