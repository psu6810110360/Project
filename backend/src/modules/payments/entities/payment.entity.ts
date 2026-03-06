import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';

// ✅ แก้ Enum ให้เป็นตัวใหญ่ทั้งหมด ให้ตรงกับ Frontend
export enum PaymentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REVOKED = 'REVOKED',
}

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  // ✅ เพิ่ม price เพื่อให้ Frontend แสดงราคาได้
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  price: number;

  @ManyToOne(() => User, (user) => user.payments, { eager: true })
  @JoinColumn({ name: 'userId' }) // เพิ่ม JoinColumn เพื่อความชัวร์
  user: User;

  @ManyToOne(() => Course, { eager: true })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column({ nullable: true }) // แก้ให้ nullable ได้เผื่อเคสไม่มีสลิป
  slipUrl: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @CreateDateColumn()
  createdAt: Date;
}