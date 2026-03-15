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

export enum PaymentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REVOKED = 'revoked',
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

  @Column({ type: 'varchar', nullable: true })
  slipUrl: string | null;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  // ==========================================
  // ✅ วันหมดอายุของสิทธิ์เข้าเรียนคอร์สนี้ (null = ไม่มีกำหนด)
  // ==========================================
  @Column({ type: 'timestamp', nullable: true, default: null })
  expiresAt: Date | null;

  // ==========================================
  // ✅ คอลัมน์เก็บ Array ของ ID วิดีโอที่ดูจบแล้ว
  // ==========================================
  @Column({ type: 'json', nullable: true })
  completedVideos: any[];

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'boolean', default: false })
  isRenewalRequested: boolean;
}
