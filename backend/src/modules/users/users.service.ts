import { Injectable, OnModuleInit, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt'; 

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    // 🗑️ ลบการเรียกใช้ JwtService ออกไปแล้ว เพราะเราให้ AuthModule จัดการแทน
  ) {}

  // 1. ฟังก์ชันสร้าง Admin อัตโนมัติ (Seeding)
  // 1. ฟังก์ชันสร้าง Admin อัตโนมัติ (Seeding)
  async onModuleInit() {
    console.log('\n🌱 กำลังตรวจสอบข้อมูลจำลอง (Seeding)...');
    try {
      const adminEmail = 'admin@test.com';
      let existingAdmin = await this.usersRepository.findOneBy({ email: adminEmail });

      const hashedPassword = await bcrypt.hash('1234', 10);

      if (!existingAdmin) {
        const admin = this.usersRepository.create({
          email: adminEmail,
          password: hashedPassword,
          role: 'admin',
          firstName: 'System',
          lastName: 'Admin',
          phone: '0000000000'
        });
        await this.usersRepository.save(admin); 
        console.log('✅ สร้างบัญชี Admin สำเร็จ (admin@test.com / 1234)\n');
      } else {
        // 👇 แก้ไขตรงนี้: ลบคำสั่ง save ทิ้งไปเลย ให้เหลือแค่ console.log แจ้งเตือนพอครับ
        console.log('⚡ เจอแอดมินเดิมในระบบ: พร้อมใช้งาน!\n');
      }
    } catch (error) {
      console.error('❌ ดำเนินการไม่สำเร็จ! สาเหตุ:', error.message, '\n');
    }
  }
  // ---------------------------------------------------------
  // 🗑️ ลบฟังก์ชัน login() ออกไปแล้ว (ย้ายไปอยู่ auth.service.ts แทน)
  // ---------------------------------------------------------

  // 2. ฟังก์ชันสร้าง User ใหม่ตอน Register
  async create(userData: Partial<User>): Promise<any> {
    // เช็คก่อนว่าอีเมลนี้ซ้ำไหม
    const existingUser = await this.usersRepository.findOneBy({ email: userData.email });
    if (existingUser) {
      throw new BadRequestException('อีเมลนี้ถูกใช้งานแล้ว'); 
    }

    // 🔐 เข้ารหัสผ่านก่อนเซฟ
    const hashedPassword = await bcrypt.hash(userData.password as string, 10);

    const newUser = this.usersRepository.create({
      ...userData,
      password: hashedPassword, 
      role: 'student', 
    });
    
    await this.usersRepository.save(newUser);
    return { message: 'สมัครสมาชิกสำเร็จ' };
  }

  // ---------------------------------------------------------
  // 👇 ส่วนสำหรับจัดการและค้นหาข้อมูล User
  // ---------------------------------------------------------

  // 🔍 3. (ฟังก์ชันใหม่) สำหรับให้ AuthService ใช้ค้นหาอีเมลตอนล็อกอิน
  async findByEmail(email: string) { // 👈 ลบ : Promise<User | undefined> ออกไปเลย
    return await this.usersRepository.findOneBy({ email });
  }

  // 🔍 4. ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้ทั้งหมดมาดู
  async findAll() {
    return await this.usersRepository.find();
  }

  // 🗑️ 5. ฟังก์ชันสำหรับลบผู้ใช้ทั้งหมด
  async clearAllUsers() {
    await this.usersRepository.clear(); // กวาดเรียบทั้งตาราง
    return { message: 'ลบข้อมูลผู้ใช้ทั้งหมดออกจากระบบแล้ว!' };
  }
}