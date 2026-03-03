// src/modules/payments/payments.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { User } from '../users/entities/user.entity';
import { Course } from '../courses/entities/course.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,

    private readonly dataSource: DataSource,
  ) {}

  // ✅ User ซื้อคอร์ส (1 slip → หลาย payment)
  async createPayments(
    userId: number,
    courseIds: string[],
    slipUrl: string,
  ) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      throw new BadRequestException('courseIds is required');
    }

    if (!slipUrl) {
      throw new BadRequestException('slipUrl is required');
    }

    const user = await this.userRepo.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const courses = await this.courseRepo.findByIds(courseIds);
    if (courses.length !== courseIds.length) {
      throw new NotFoundException('Some courses not found');
    }

    const payments = courses.map((course) =>
      this.paymentRepo.create({
        user,
        course,
        slipUrl,
        status: PaymentStatus.PENDING,
      }),
    );

    return this.paymentRepo.save(payments);
  }

  // ✅ Admin ดู payments ทั้งหมด
  async findAll() {
    return this.paymentRepo.find({
      relations: ['user', 'course'],
      order: { createdAt: 'DESC' },
    });
  }

  // ✅ User ดู payments ของตัวเอง (MyClassroom)
  async findByUser(userId: number) {
    return this.paymentRepo.find({
      where: { user: { id: userId } },
      relations: ['course'],
      order: { createdAt: 'DESC' },
    });
  }

  // ✅ Admin Approve (transaction-safe)
  async approvePayment(paymentId: number) {
    return this.dataSource.transaction(async (manager) => {
      const payment = await manager.findOne(Payment, {
        where: { id: paymentId },
        relations: ['user', 'course', 'user.courses'],
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      if (payment.status !== PaymentStatus.PENDING) {
        throw new BadRequestException('Payment already processed');
      }

      // 1️⃣ update payment status
      payment.status = PaymentStatus.APPROVED;
      await manager.save(payment);

      // 2️⃣ add course to user (กันซ้ำ)
      const alreadyHave = payment.user.courses?.some(
        (c) => c.id === payment.course.id,
      );

      if (!alreadyHave) {
        payment.user.courses = [
          ...(payment.user.courses || []),
          payment.course,
        ];
        await manager.save(payment.user);
      }

      return payment;
    });
  }

  // ✅ Admin Reject
  async rejectPayment(paymentId: number) {
    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment already processed');
    }

    payment.status = PaymentStatus.REJECTED;
    return this.paymentRepo.save(payment);
  }
}