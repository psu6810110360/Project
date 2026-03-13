import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';

import { Course } from '../../courses/entities/course.entity';
import { Payment } from '../../payments/entities/payment.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'student' })
  role: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @ManyToMany(() => Course, (course) => course.users)
  @JoinTable({ name: 'user_courses' })
  courses: Course[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];
  
  @Column({ nullable: true })
  profilePicture: string;
}