import { Injectable, OnModuleInit, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt'; // 👈 1. Import ตัวสร้าง JWT
import * as bcrypt from 'bcrypt';         // 👈 2. Import ตัวเข้ารหัสผ่าน

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService, // 👈 3. ฉีด JwtService เข้ามาใช้งาน
  ) {}

  // 1. ฟังก์ชันสร้าง Admin อัตโนมัติ (Seeding)
  async onModuleInit() {
    console.log('\n🌱 กำลังตรวจสอบข้อมูลจำลอง (Seeding)...');
    try {
      const adminEmail = 'admin@test.com';
      let existingAdmin = await this.usersRepository.findOneBy({ email: adminEmail });

      // 🔐 เข้ารหัสผ่าน '1234' ให้ปลอดภัยก่อนเซฟลงฐานข้อมูล
      const hashedPassword = await bcrypt.hash('1234', 10);

      if (!existingAdmin) {
        const admin = this.usersRepository.create({
          email: adminEmail,
          password: hashedPassword, // เซฟรหัสที่เข้ารหัสแล้ว
          role: 'admin',
          firstName: 'System',
          lastName: 'Admin',
          phone: '0000000000'
        });
        await this.usersRepository.save(admin); 
        console.log('✅ สร้างบัญชี Admin สำเร็จ (admin@test.com / 1234)\n');
      } else {
        existingAdmin.password = hashedPassword;
        existingAdmin.role = 'admin'; 
        await this.usersRepository.save(existingAdmin);
        console.log('⚡ เจอแอดมินเดิมในระบบ: ทำการรีเซ็ตรหัสผ่านและยศ Admin ให้แล้ว!\n');
      }
    } catch (error) {
      console.error('❌ ดำเนินการไม่สำเร็จ! สาเหตุ:', error.message, '\n');
    }
  }

  // 2. ฟังก์ชันตรวจสอบและ Login (เปลี่ยนชื่อจาก validateUser เป็น login เพื่อให้จำง่าย)
  async login(email: string, pass: string): Promise<any> {
    console.log(`\n--- 🕵️‍♂️ แอบดูการ Login ---`);
    const user = await this.usersRepository.findOneBy({ email });
    
    console.log(`ค้นหาอีเมล ${email} ใน DB:`, user ? '✅ เจอข้อมูล!' : '❌ ไม่เจอข้อมูล!');

    if (user) {
      // 🔐 ใช้ bcrypt เทียบรหัสผ่านที่ส่งมา กับรหัสที่ถูกเข้ารหัสไว้ใน DB
      const isMatch = await bcrypt.compare(pass, user.password);

      if (isMatch) {
        console.log(`สรุป: รหัสผ่านตรงกันเป๊ะ! ล็อกอินสำเร็จ 🎉\n`);
        
        // 🎟️ สร้าง JWT Token ยัด role เข้าไปด้วย React จะได้เอาไปแกะดูได้
        const payload = { sub: user.id, email: user.email, role: user.role };
        
        return {
          message: 'Login successful',
          token: this.jwtService.sign(payload), // 👈 ส่ง token ตัวนี้กลับไปให้หน้า React!
        };
      } else {
        console.log(`4. สรุป: รหัสผ่าน **ไม่ตรงกัน**! (โดนเตะออก) ❌\n`);
        throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }
    }
    throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
  }

  // 3. ฟังก์ชันสร้าง User ใหม่ตอน Register
  async create(userData: Partial<User>): Promise<any> {
    // เช็คก่อนว่าอีเมลนี้ซ้ำไหม
    const existingUser = await this.usersRepository.findOneBy({ email: userData.email });
    if (existingUser) {
      throw new BadRequestException('อีเมลนี้ถูกใช้งานแล้ว'); 
    }

    // 🔐 เข้ารหัสผ่านก่อนเซฟ
    // 🔐 เข้ารหัสผ่านก่อนเซฟ (เติม as string ลงไปหลัง userData.password)
const hashedPassword = await bcrypt.hash(userData.password as string, 10);

    const newUser = this.usersRepository.create({
      ...userData,
      password: hashedPassword, // เซฟรหัสที่เข้ารหัสแล้ว
      role: 'student', 
    });
    
    await this.usersRepository.save(newUser);
    return { message: 'สมัครสมาชิกสำเร็จ' };
  }
}