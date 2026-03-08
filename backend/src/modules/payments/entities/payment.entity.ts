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

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  price: number;

  @ManyToOne(() => User, (user) => user.payments, { eager: true })
  @JoinColumn({ name: 'userId' }) 
  user: User;

  @ManyToOne(() => Course, { eager: true })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column({ nullable: true }) 
  slipUrl: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  // ==========================================
  // ✅ [เพิ่มตรงนี้] คอลัมน์เก็บ Array ของ ID วิดีโอที่ดูจบแล้ว
  // ==========================================
  @Column({ type: 'json', nullable: true })
  completedVideos: any[];

  @CreateDateColumn()
  createdAt: Date;
}