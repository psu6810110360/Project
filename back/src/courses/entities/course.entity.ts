import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string; // ชื่อคอร์ส

  @Column({ type: 'text', nullable: true })
  shortDescription: string; // รายละเอียดสั้น

  @Column({ default: true })
  isActive: boolean; // สถานะ (true = Active, false = Inactive)

  @Column('decimal', { precision: 10, scale: 2 })
  originalPrice: number; // ราคาเดิม

  @Column('decimal', { precision: 10, scale: 2 })
  salePrice: number; // ราคาขาย

  @Column({ nullable: true })
  coverImageUrl: string; // รูปภาพปก (เก็บเป็น Path หรือ URL)

  @Column({ nullable: true })
  sampleVideoUrl: string; // วิดีโอตัวอย่างคอร์ส (เก็บเป็น Path หรือ URL)
  
  @Column({ nullable: true })
  instructorName: string; // ชื่อครูผู้สอน

  @Column({ nullable: true })
  instructorImageUrl: string; // รูปครูผู้สอน
  
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}