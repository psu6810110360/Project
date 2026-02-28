import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Course } from '../courses/entities/course.entity'; 
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Course) 
    private coursesRepository: Repository<Course>,
  ) {}

  async onModuleInit() {
    console.log('\n🌱 กำลังตรวจสอบข้อมูลจำลอง (Seeding)...');
    try {
      const adminEmail = 'admin@test.com';
      const existingAdmin = await this.usersRepository.findOneBy({ email: adminEmail });
      
      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('1234', 10);
        const admin = this.usersRepository.create({
          email: adminEmail,
          password: hashedPassword,
          role: 'admin',
          firstName: 'System',
          lastName: 'Admin',
          phone: '0000000000'
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

  findAll() {
    return this.usersRepository.find({
      relations: ['courses'] // 👈 ให้ดึงคอร์สออกมาโชว์ตอนดู User ทั้งหมดด้วย
    });
  }

  async findByEmail(email: string) {
    return await this.usersRepository.findOne({ where: { email } });
  }

  // 🔍 2. ดึงข้อมูล User (ต้องใส่ relations: ['courses'] เพื่อให้เห็นคอร์ส)
  async findOne(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['courses'], // 👈 สำคัญมาก! ขาดบรรทัดนี้คอร์สจะไม่ส่งไปที่ Frontend
    });
    if (!user) throw new NotFoundException('ไม่พบผู้ใช้งาน');
    return user;
  }

  // 🛒 3. เพิ่มคอร์สเข้าบัญชีผู้ใช้
  // 🛒 3. เพิ่มคอร์สเข้าบัญชีผู้ใช้
  async addCourseToUser(userId: number, courseId: string) { 
    // 1. หา User พร้อมกับคอร์สที่เขามีอยู่แล้ว
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['courses'],
    });
    if (!user) throw new NotFoundException('ไม่พบผู้ใช้งาน');

    // 2. หา Course ที่เขากำลังจะซื้อ
    const course = await this.coursesRepository.findOneBy({ id: courseId as any });
    if (!course) throw new NotFoundException('ไม่พบหลักสูตร');

    // 3. ตรวจสอบว่าคอร์สนี้มีอยู่แล้วไหม (กันซื้อซ้ำ)
    if (!user.courses) user.courses = [];
    
    // ✅ แก้ไขแล้ว: แปลงเป็น String ทั้งคู่ก่อนเทียบ VS Code จะไม่ Error และบัค 500 จะหายไป
    const alreadyHas = user.courses.some(c => String(c.id) === String(courseId));
    
    if (!alreadyHas) {
      user.courses.push(course); 
      await this.usersRepository.save(user); 
    }
    
    return user;
  }

  // ➖ 4. ลบคอร์สออกจากผู้ใช้
  async removeCourseFromUser(userId: number, courseId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['courses'],
    });
    if (!user) throw new NotFoundException('ไม่พบผู้ใช้งาน');

    if (user.courses) {
        // ✅ แก้ไขแล้ว: แปลงเป็น String ทั้งคู่
        user.courses = user.courses.filter(c => String(c.id) !== String(courseId));
    }
    
    return await this.usersRepository.save(user);
  }

  // 🗑️ 5. ลบผู้ใช้ (Admin สั่งลบ)
  async removeUser(id: number) {
    const user = await this.findOne(id);
    return this.usersRepository.remove(user);
  }
}