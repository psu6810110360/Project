import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // 1. ฟังก์ชันสร้าง Admin อัตโนมัติ (Seeding)
  async onModuleInit() {
    console.log('\n🌱 กำลังตรวจสอบข้อมูลจำลอง (Seeding)...');
    try {
      const adminEmail = 'admin@test.com';
      let existingAdmin = await this.usersRepository.findOneBy({ email: adminEmail });

      if (!existingAdmin) {
        // ถ้ายังไม่มีแอดมิน ให้สร้างใหม่
        const admin = this.usersRepository.create({
          email: adminEmail,
          password: '1234', 
          role: 'admin',
          firstName: 'System',
          lastName: 'Admin',
          phone: '0000000000'
        });
        await this.usersRepository.save(admin);
        console.log('✅ สร้างบัญชี Admin สำเร็จ (admin@test.com / 1234)\n');
      } else {
        // 🚨 ถ้ามีแอดมินอยู่แล้ว ให้บังคับรีเซ็ตรหัสผ่านเป็น 1234 ทับไปเลย
        existingAdmin.password = '1234';
        await this.usersRepository.save(existingAdmin);
        console.log('⚡ เจอแอดมินเดิมในระบบ: ทำการรีเซ็ตรหัสผ่านกลับเป็น 1234 ให้แล้ว!\n');
      }
    } catch (error) {
      console.error('❌ ดำเนินการไม่สำเร็จ! สาเหตุ:', error.message, '\n');
    }
  }

  // 2. ฟังก์ชันตรวจสอบตอน Login
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersRepository.findOneBy({ email });
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null; // ถ้าไม่เจอ หรือรหัสผิด จะคืนค่า null
  }

  // 3. ฟังก์ชันสร้าง User ใหม่ตอน Register
  async create(userData: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create({
      ...userData,
      role: 'student', // บังคับให้เป็นนักเรียนเสมอ
    });
    return this.usersRepository.save(newUser);
  }
}