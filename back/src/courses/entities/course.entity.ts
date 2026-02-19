import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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

  // ใช้ type 'decimal' สำหรับราคาเพื่อความแม่นยำแบบวิศวกร PSU
  @Column('decimal', { precision: 10, scale: 2 })
  originalPrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  salePrice: number;

  @Column({ nullable: true })
  coverImageUrl: string;

  @Column({ nullable: true })
  sampleVideoUrl: string;
  
  @Column({ nullable: true })
  instructorName: string;

  @Column({ nullable: true })
  instructorImageUrl: string;

  // 🌟 เปลี่ยนจาก @Prop() เป็น @Column() ให้หมด
  @Column({ nullable: true })
  suitableFor: string; // เหมาะสำหรับ

  @Column({ nullable: true })
  classTime: string;   // เวลาเรียน

  // 🌟 สำหรับ Array ของ Object ใน TypeORM ให้ใช้ type 'json' หรือ 'simple-json'
  @Column({ type: 'json', nullable: true })
  courseContents: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}