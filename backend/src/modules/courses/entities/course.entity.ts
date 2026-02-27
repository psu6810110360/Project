import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';

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

  @ManyToMany(() => User, (user) => user.courses)
  users: User[];
}