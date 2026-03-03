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
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
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
    // ❗ ระบบใหม่ไม่ดึง courses แล้ว
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
  // 6. ADD COURSE TO USER (DEPRECATED)
  // =========================
  /**
   * ⚠️ ฟังก์ชันนี้ถูก "ยกเลิกการใช้งานเชิงธุรกิจ"
   * ระบบใหม่ใช้ Payment เป็นตัวกลาง
   * แต่คงฟังก์ชันไว้เพื่อไม่ให้ route / frontend เก่าพัง
   */
  async addCourseToUser(userId: number, courseId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('ไม่พบผู้ใช้งาน');

    // ❌ ไม่ทำอะไรแล้ว
    // ✅ คืน user กลับไปเฉย ๆ
    return user;
  }

  // =========================
  // 7. REMOVE COURSE FROM USER (DEPRECATED)
  // =========================
  /**
   * ⚠️ Deprecated เช่นเดียวกัน
   */
  async removeCourseFromUser(userId: number, courseId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('ไม่พบผู้ใช้งาน');

    return user;
  }

  // =========================
  // 8. REMOVE USER
  // =========================
  async removeUser(id: number) {
    const user = await this.findOne(id);
    return this.usersRepository.remove(user);
  }
}