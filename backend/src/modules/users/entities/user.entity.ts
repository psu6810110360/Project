// src/modules/users/entities/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Course } from '../../courses/entities/course.entity';
import { Order } from '../../orders/entities/order.entity';

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

  // 🔗 ส่วนที่ 1: คอร์สที่เรียนได้แล้ว (Approved แล้วจะถูกยัดใส่ลิสต์นี้)
  @ManyToMany(() => Course, (course) => course.users, { onDelete: 'CASCADE' })
  @JoinTable({ name: 'user_courses' }) 
  courses: Course[];

  // 🔗 ส่วนที่ 2: ประวัติการสั่งซื้อ (รวมทั้งที่รออนุมัติ และอนุมัติแล้ว)
  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}