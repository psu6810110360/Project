// src/modules/payments/payments.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Payment, PaymentStatus } from './entities/payment.entity';
import { User } from '../users/entities/user.entity';
import { Course } from '../courses/entities/course.entity';
// ✅ นำเข้าตารางเชื่อมใหม่
import { UserCourse } from '../users/entities/user_course.entity'; 
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

    // ✅ ฉีด Repository ของ UserCourse เข้ามา
    @InjectRepository(UserCourse)
    private userCourseRepo: Repository<UserCourse>, 
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

      const actualPrice = Number(course.salePrice) || Number(course.originalPrice) || 0;

      const payment = this.paymentRepo.create({
        user,
        course,
        price: actualPrice,
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

  // ==========================================
  // 🟢 แก้ไข: อนุมัติสลิปและเพิ่มคอร์สลงตาราง UserCourse พร้อมคำนวณวันหมดอายุ
  // ==========================================
  async approve(id: number, customExpiresAt?: Date | null) {
    const payment = await this.paymentRepo.findOne({
      where: { id },
      relations: ['user', 'course'],
    });

    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status === PaymentStatus.APPROVED) return payment;

    // 1. คำนวณวันหมดอายุ (ดึงค่าจาก Course ถ้าไม่ได้ส่งมา)
    let finalExpiresAt = customExpiresAt || null;
    if (!finalExpiresAt && payment.course.accessDurationSeconds && payment.course.accessDurationSeconds > 0) {
      finalExpiresAt = new Date();
      finalExpiresAt.setSeconds(finalExpiresAt.getSeconds() + payment.course.accessDurationSeconds);
    }

    // 2. อัปเดตสถานะ Payment
    payment.status = PaymentStatus.APPROVED;
    payment.expiresAt = finalExpiresAt;
    await this.paymentRepo.save(payment);

    // 3. เช็คว่ามีในตาราง UserCourse หรือยัง
    const existingRecord = await this.userCourseRepo.findOne({
      where: { user: { id: payment.user.id }, course: { id: payment.course.id } }
    });

    // 4. ถ้ายังไม่มี ให้สร้างขึ้นมาใหม่ (แทรกคอร์สให้นักเรียน)
    if (!existingRecord) {
      const newUserCourse = this.userCourseRepo.create({
        user: payment.user,
        course: payment.course,
        expiresAt: finalExpiresAt,
        isExtensionRequested: false
      });
      await this.userCourseRepo.save(newUserCourse);
    } else {
      // ถ้ามีอยู่แล้วแต่ของเก่าหมดอายุ ก็อัปเดตวันหมดอายุให้ใหม่
      existingRecord.expiresAt = finalExpiresAt;
      existingRecord.isExtensionRequested = false;
      await this.userCourseRepo.save(existingRecord);
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
  // 🔴 แก้ไข: ลบ enrollment คอร์สของ user ให้ลบจากตาราง UserCourse
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

    // 2. ลบสิทธิ์คอร์สออกจากตาราง user_courses แทน
    const userCourseRecord = await this.userCourseRepo.findOne({
      where: { user: { id: userId }, course: { id: courseId } }
    });

    if (userCourseRecord) {
      await this.userCourseRepo.remove(userCourseRecord);
    }

    return { success: true, message: 'ลบคอร์สออกจากผู้เรียนเรียบร้อยแล้ว' };
  }

  // ==========================================
  // ✅ บันทึกความคืบหน้าว่าดูวิดีโอจบแล้ว (เหมือนเดิม)
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