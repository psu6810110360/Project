// src/modules/payments/payments.service.ts
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

  async create(userId: number, dto: CreatePaymentDto) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const payments: Payment[] = [];

    for (const courseId of dto.courseIds) {
      const idToCheck = String(courseId);
      const course = await this.courseRepo.findOneBy({ id: idToCheck });

      if (!course) {
        throw new NotFoundException(`Course ${courseId} not found`);
      }

      // ✅ แก้ไขตรงนี้: ดึงราคาจาก salePrice เป็นหลัก ถ้าไม่มีให้ใช้ originalPrice
      const actualPrice = Number(course.salePrice) || Number(course.originalPrice) || 0;

      const payment = this.paymentRepo.create({
        user,
        course,
        price: actualPrice, // 👈 ใช้ราคาที่คำนวณได้แล้ว
        slipUrl: dto.slipUrl,
        status: PaymentStatus.PENDING,
      });

      payments.push(payment);
    }

    return this.paymentRepo.save(payments);
  }

  async findMyCourses(userId: number) {
    return this.paymentRepo.find({
      where: { user: { id: userId } },
      relations: ['course'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAll() {
    return this.paymentRepo.find({
      relations: ['user', 'course'],
      order: { createdAt: 'DESC' },
    });
  }

  async findPending() {
    return this.paymentRepo.find({
      where: { status: PaymentStatus.PENDING },
      relations: ['user', 'course'],
      order: { createdAt: 'ASC' },
    });
  }

  async approve(id: number, expiresAt?: Date | null) {
    const payment = await this.paymentRepo.findOne({
      where: { id },
      relations: ['user', 'course'],
    });

    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status === PaymentStatus.APPROVED) return payment;

    payment.status = PaymentStatus.APPROVED;
    if (expiresAt !== undefined) {
      payment.expiresAt = expiresAt;
    }
    await this.paymentRepo.save(payment);

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

  async reject(id: number) {
    const payment = await this.paymentRepo.findOne({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');

    payment.status = PaymentStatus.REJECTED;
    return this.paymentRepo.save(payment);
  }

  // ==========================================
  // ✅ ลบ enrollment คอร์สของ user ออกทั้งหมด
  //    (ลบจาก user_courses + ลบ payment records)
  // ==========================================
  async deleteCourseEnrollment(userId: number, courseId: string) {
    // 1. ลบ payment records ของคอร์สนี้ออกทั้งหมด
    const payments = await this.paymentRepo.find({
      where: { user: { id: userId }, course: { id: courseId } },
      relations: ['user', 'course'],
    });

    if (payments.length > 0) {
      await this.paymentRepo.remove(payments);
    }

    // 2. ลบสิทธิ์คอร์สออกจากตาราง user_courses
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['courses'],
    });

    if (user && user.courses) {
      user.courses = user.courses.filter((c) => String(c.id) !== String(courseId));
      await this.userRepo.save(user);
    }

    return { success: true, message: 'ลบคอร์สออกจากผู้เรียนเรียบร้อยแล้ว' };
  }

  // ==========================================
  // ✅ บันทึกความคืบหน้าว่าดูวิดีโอจบแล้ว
  // ==========================================
  async markVideoAsCompleted(userId: number, courseId: string, videoId: string) {
    const payment = await this.paymentRepo.findOne({
      where: {
        user: { id: userId },
        course: { id: courseId },
        status: PaymentStatus.APPROVED,
      },
    });

    if (!payment) {
      throw new NotFoundException('ไม่พบสิทธิ์การเข้าเรียนคอร์สนี้ หรือยังไม่อนุมัติ');
    }

    let completed = payment.completedVideos || [];

    if (!completed.includes(videoId)) {
      completed.push(videoId);
      payment.completedVideos = completed;
      await this.paymentRepo.save(payment);
    }

    return {
      message: 'บันทึกการดูวิดีโอสำเร็จ',
      completedVideos: payment.completedVideos,
    };
  }
}