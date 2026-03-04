import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  nickname: string;

  @Column({ nullable: true })
  course: string;

  @Column({ nullable: true })
  university: string;

  @Column({ nullable: true })
  faculty: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  imageUrl: string;
  
  @Column({ nullable: true })
  logoUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}