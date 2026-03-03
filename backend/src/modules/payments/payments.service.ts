import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Payment, PaymentStatus } from './entities/payment.entity';
import { User } from '../users/entities/user.entity';
import { Course } from '../courses/entities/course.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
  ) {}

  // =========================
  // USER: CREATE PAYMENT
  // =========================
  async create(userId: number, dto: CreatePaymentDto) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const payments: Payment[] = [];

    for (const courseId of dto.courseIds) {
      // แปลง ID เป็น String เสมอ
      const idToCheck = String(courseId); 

      const course = await this.courseRepo.findOneBy({
        id: idToCheck, 
      });
      
      if (!course) {
        throw new NotFoundException(`Course ${courseId} not found`);
      }

      const payment = this.paymentRepo.create({
        user,
        course,
        price: (course as any).price || 0, 
        slipUrl: dto.slipUrl,
        // ✅ สำคัญ: ต้องเป็น PENDING เสมอเมื่อสร้างใหม่
        status: PaymentStatus.PENDING,
      });

      payments.push(payment);
    }

    return this.paymentRepo.save(payments);
  }

  // =========================
  // USER: MY CLASSROOM (แก้ไขแล้ว)
  // =========================
  async findMyCourses(userId: number) {
    return this.paymentRepo.find({
      // ✅ เอา status: APPROVED ออก! 
      // เพื่อให้ Frontend ได้ข้อมูลไปแสดงในส่วน "รอการอนุมัติ" ได้
      where: { user: { id: userId } }, 
      relations: ['course'],
      order: { createdAt: 'DESC' },
    });
  }

  // =========================
  // ADMIN: FIND ALL
  // =========================
  async findAll() {
    return this.paymentRepo.find({
      relations: ['user', 'course'],
      order: { createdAt: 'DESC' },
    });
  }

  // =========================
  // ADMIN: VIEW PENDING PAYMENTS
  // =========================
  async findPending() {
    return this.paymentRepo.find({
      where: { status: PaymentStatus.PENDING },
      relations: ['user', 'course'],
      order: { createdAt: 'ASC' },
    });
  }

  // =========================
  // ADMIN: APPROVE PAYMENT
  // =========================
  async approve(id: number) {
    const payment = await this.paymentRepo.findOne({
      where: { id },
      relations: ['user', 'course'],
    });

    if (!payment) throw new NotFoundException('Payment not found');

    if (payment.status === PaymentStatus.APPROVED) return payment;

    // อัปเดตสถานะ
    payment.status = PaymentStatus.APPROVED;
    await this.paymentRepo.save(payment);

    // เพิ่มคอร์สให้ User
    const user = await this.userRepo.findOne({
      where: { id: payment.user.id },
      relations: ['courses'],
    });

    if (!user) throw new NotFoundException('User not found');

    if (!user.courses) user.courses = [];

    const exists = user.courses.some(
      (c) => String(c.id) === String(payment.course.id),
    );

    if (!exists) {
      user.courses.push(payment.course);
      await this.userRepo.save(user);
    }

    return payment;
  }

  // =========================
  // ADMIN: REJECT PAYMENT
  // =========================
  async reject(id: number) {
    const payment = await this.paymentRepo.findOne({ where: { id } });
    
    if (!payment) throw new NotFoundException('Payment not found');

    payment.status = PaymentStatus.REJECTED;
    return this.paymentRepo.save(payment);
  }
}