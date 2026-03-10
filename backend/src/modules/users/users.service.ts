// src/modules/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { Course } from '../courses/entities/course.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,

    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  // =========================
  // 1. CREATE USER
  // =========================
  async create(userData: any) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new ConflictException('อีเมลนี้ถูกใช้งานแล้วครับ');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = this.usersRepository.create({
      ...userData,
      password: hashedPassword,
      role: userData.role || 'user',
    });

    const savedUser = await this.usersRepository.save(newUser);

    const { password, ...result } = savedUser as any;
    return result;
  }

  // =========================
  // 2. SEED ADMIN
  // =========================
  async onModuleInit() {
    console.log('\n🌱 กำลังตรวจสอบข้อมูลจำลอง (Seeding)...');
    try {
      const adminEmail = 'admin@test.com';
      const existingAdmin = await this.usersRepository.findOneBy({
        email: adminEmail,
      });

      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('1234', 10);
        const admin = this.usersRepository.create({
          email: adminEmail,
          password: hashedPassword,
          role: 'admin',
          firstName: 'System',
          lastName: 'Admin',
          phone: '0000000000',
        });
        await this.usersRepository.save(admin);
        console.log('✅ สร้างบัญชี Admin สำเร็จ!');
      } else {
        console.log('⚡ มีบัญชี Admin อยู่แล้ว ข้ามการสร้างใหม่');
      }
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการ Seeding Admin:', error);
    }
  }

  // =========================
  // 3. FIND ALL USERS
  // =========================
  findAll() {
    return this.usersRepository.find();
  }

  // =========================
  // 4. FIND BY EMAIL
  // =========================
  async findByEmail(email: string) {
    return await this.usersRepository.findOne({ where: { email } });
  }

  // =========================
  // 5. FIND ONE USER
  // =========================
  async findOne(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
    });
    if (!user) throw new NotFoundException('ไม่พบผู้ใช้งาน');
    return user;
  }

  // =========================
  // 6. ADD COURSE TO USER (manual) + บันทึก expiresAt ใน payment
  // =========================
  async addCourseToUser(userId: number, courseId: string, expiresAt?: Date | null) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['courses'],
    });

    if (!user) throw new NotFoundException('ไม่พบผู้ใช้งาน');

    const course = await this.courseRepository.findOneBy({ id: courseId });
    if (!course) throw new NotFoundException('ไม่พบคอร์ส');

    if (!user.courses) user.courses = [];

    // ป้องกันการแอดคอร์สซ้ำ
    const exists = user.courses.some(c => String(c.id) === String(courseId));
    if (!exists) {
      user.courses.push(course);
      await this.usersRepository.save(user);
    }

    // สร้าง payment record แบบ manual (approved ทันที) พร้อม expiresAt
    // ตรวจสอบก่อนว่ามี manual payment อยู่แล้วหรือยัง
    const existingPayment = await this.paymentRepository.findOne({
      where: {
        user: { id: userId },
        course: { id: courseId },
        status: PaymentStatus.APPROVED,
      },
    });

    if (!existingPayment) {
      // สร้าง manual payment record ใหม่
      const manualPayment = this.paymentRepository.create({
        user,
        course,
        price: 0,
        slipUrl: null,
        status: PaymentStatus.APPROVED,
        expiresAt: expiresAt || null,
      });
      await this.paymentRepository.save(manualPayment);
    } else if (expiresAt !== undefined) {
      // อัปเดต expiresAt ถ้ามี payment อยู่แล้ว
      existingPayment.expiresAt = expiresAt;
      await this.paymentRepository.save(existingPayment);
    }

    return user;
  }

  // =========================
  // 7. REMOVE COURSE FROM USER
  // =========================
  async removeCourseFromUser(userId: number, courseId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['courses'],
    });

    if (!user) throw new NotFoundException('ไม่พบผู้ใช้งาน');

    if (user.courses) {
      user.courses = user.courses.filter(c => String(c.id) !== String(courseId));
      await this.usersRepository.save(user);
    }

    return user;
  }

  // =========================
  // 8. REMOVE USER
  // =========================
  async removeUser(id: number) {
    const user = await this.findOne(id);

    // ✅ ลบ payments ของ user ก่อน เพื่อหลีกเลี่ยง FK constraint error
    await this.paymentRepository.delete({ user: { id } });

    return this.usersRepository.remove(user);
  }
}