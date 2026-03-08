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

      const payment = this.paymentRepo.create({
        user,
        course,
        price: (course as any).price || 0, 
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

  async approve(id: number) {
    const payment = await this.paymentRepo.findOne({
      where: { id },
      relations: ['user', 'course'],
    });

    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status === PaymentStatus.APPROVED) return payment;

    payment.status = PaymentStatus.APPROVED;
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

  async revoke(id: number) {
    // เก็บฟังก์ชันนี้ไว้เผื่อมีการเรียกใช้งานจากจุดอื่น
    const payment = await this.paymentRepo.findOne({
      where: { id },
      relations: ['user', 'course'],
    });
    if (!payment) throw new NotFoundException('Payment not found');

    payment.status = 'REVOKED' as PaymentStatus;
    await this.paymentRepo.save(payment);

    if (payment.user && payment.course) {
      const user = await this.userRepo.findOne({
        where: { id: payment.user.id },
        relations: ['courses'],
      });
      if (user && user.courses) {
        user.courses = user.courses.filter(
          (c) => String(c.id) !== String(payment.course.id)
        );
        await this.userRepo.save(user);
      }
    }
    return payment;
  }

  // ==========================================
  // ✅ ฟังก์ชันระงับสิทธิ์ขั้นเด็ดขาด (ลบสิทธิ์ 100%)
  // ==========================================
  async revokeCourseAccess(userId: number, courseId: string) {
    // 1. เปลี่ยนสถานะ Payment ทั้งหมดของคอร์สนี้ให้เป็น 'revoked'
    const payments = await this.paymentRepo.find({
      where: { user: { id: userId }, course: { id: courseId } },
      relations: ['user', 'course'],
    });

    for (const p of payments) {
      p.status = 'REVOKED' as any; // อัปเดตสถานะเป็นตัวใหญ่หรือเล็กตามฐานข้อมูล
      await this.paymentRepo.save(p);
    }

    // 2. ดึงสิทธิ์คอร์สออกจากตาราง User ป้องกันการเข้าถึง
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['courses'],
    });

    if (user && user.courses) {
      user.courses = user.courses.filter((c) => String(c.id) !== String(courseId));
      await this.userRepo.save(user);
    }

    return { success: true, message: 'ระงับสิทธิ์สำเร็จ' };
  }

// ==========================================
  // ✅ บันทึกความคืบหน้าว่าดูวิดีโอจบแล้ว
  // ==========================================
  async markVideoAsCompleted(userId: number, courseId: string, videoId: string) {
    // 1. หาประวัติการซื้อคอร์สนี้ของนักเรียนที่ผ่านการอนุมัติแล้ว
    const payment = await this.paymentRepo.findOne({
      where: { 
        user: { id: userId }, 
        course: { id: courseId }, 
        status: PaymentStatus.APPROVED 
      }
    });

    if (!payment) {
      throw new NotFoundException('ไม่พบสิทธิ์การเข้าเรียนคอร์สนี้ หรือยังไม่อนุมัติ');
    }

    // 2. ดึงข้อมูลวิดีโอที่เคยดูจบแล้วออกมา (ถ้ายังไม่มีให้เป็น Array ว่าง)
    let completed = payment.completedVideos || [];

    // 3. เช็คว่าเคยกดจบวิดีโอนี้ไปแล้วหรือยัง ถ้ายังให้เพิ่มเข้าไป
    if (!completed.includes(videoId)) {
      completed.push(videoId);
      payment.completedVideos = completed;
      await this.paymentRepo.save(payment);
    }

    return { 
      message: 'บันทึกการดูวิดีโอสำเร็จ', 
      completedVideos: payment.completedVideos 
    };
  }
}