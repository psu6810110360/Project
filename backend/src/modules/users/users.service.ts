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
        
        // 👇👇 เพิ่มบรรทัดนี้ลงไป เพื่อยึดยศแอดมินคืนมา! 👇👇
        existingAdmin.role = 'admin'; 
        // 👆👆 ===================================== 👆👆

        await this.usersRepository.save(existingAdmin);
        console.log('⚡ เจอแอดมินเดิมในระบบ: ทำการรีเซ็ตรหัสผ่านและยศ Admin ให้แล้ว!\n');
      }
    } catch (error) {
      console.error('❌ ดำเนินการไม่สำเร็จ! สาเหตุ:', error.message, '\n');
    }
  }

  // 2. ฟังก์ชันตรวจสอบตอน Login
  async validateUser(email: string, pass: string): Promise<any> {
    console.log(`\n--- 🕵️‍♂️ แอบดูการ Login ---`);
    const user = await this.usersRepository.findOneBy({ email });
    
    console.log(`1. ค้นหาอีเมล ${email} ใน DB:`, user ? '✅ เจอข้อมูล!' : '❌ ไม่เจอข้อมูล!');

    if (user) {
      console.log(`2. รหัสผ่านที่บันทึกอยู่ใน DB: "${user.password}"`);
      console.log(`3. รหัสผ่านที่พิมพ์จากหน้าเว็บ: "${pass}"`);

      if (user.password === pass) {
        console.log(`4. สรุป: รหัสผ่านตรงกันเป๊ะ! ล็อกอินสำเร็จ 🎉\n`);
        const { password, ...result } = user;
        return result;
      } else {
        console.log(`4. สรุป: รหัสผ่าน **ไม่ตรงกัน**! (โดนเตะออก) ❌\n`);
      }
    }
    return null;
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