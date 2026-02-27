<<<<<<< HEAD
import { Injectable, OnModuleInit, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt'; 
=======
import { Injectable, OnModuleInit, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Course } from '../courses/entities/course.entity'; 
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';         
>>>>>>> feature/cart

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
<<<<<<< HEAD
    // 🗑️ ลบการเรียกใช้ JwtService ออกไปแล้ว เพราะเราให้ AuthModule จัดการแทน
=======
    @InjectRepository(Course) 
    private coursesRepository: Repository<Course>,
    private jwtService: JwtService,
>>>>>>> feature/cart
  ) {}

  // 1. ฟังก์ชันสร้าง Admin อัตโนมัติ (Seeding)
  // 1. ฟังก์ชันสร้าง Admin อัตโนมัติ (Seeding)
  async onModuleInit() {
    console.log('\n🌱 กำลังตรวจสอบข้อมูลจำลอง (Seeding)...');
    try {
      const adminEmail = 'admin@test.com';
      let existingAdmin = await this.usersRepository.findOneBy({ email: adminEmail });
<<<<<<< HEAD

=======
>>>>>>> feature/cart
      const hashedPassword = await bcrypt.hash('1234', 10);

      if (!existingAdmin) {
        const admin = this.usersRepository.create({
<<<<<<< HEAD
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
=======
          email: adminEmail, password: hashedPassword, role: 'admin',
          firstName: 'System', lastName: 'Admin', phone: '0000000000'
        });
        await this.usersRepository.save(admin); 
        console.log('✅ สร้างบัญชี Admin สำเร็จ\n');
>>>>>>> feature/cart
      }
    } catch (error) {
      console.error('❌ Seeding ไม่สำเร็จ:', error.message);
    }
  }
  // ---------------------------------------------------------
  // 🗑️ ลบฟังก์ชัน login() ออกไปแล้ว (ย้ายไปอยู่ auth.service.ts แทน)
  // ---------------------------------------------------------

<<<<<<< HEAD
  // 2. ฟังก์ชันสร้าง User ใหม่ตอน Register
=======
  // 2. ฟังก์ชันตรวจสอบและ Login
  async login(email: string, pass: string): Promise<any> {
    const user = await this.usersRepository.findOneBy({ email });
    if (user) {
      const isMatch = await bcrypt.compare(pass, user.password);
      if (isMatch) {
        const payload = { sub: user.id, email: user.email, role: user.role };
        return {
          message: 'Login successful',
          token: this.jwtService.sign(payload),
          userId: user.id, // ส่งกลับไปเพื่อให้หน้าบ้านเก็บลง localStorage
          userRole: user.role
        };
      }
    }
    throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
  }

  // 3. ฟังก์ชันสร้าง User ใหม่ตอน Register
>>>>>>> feature/cart
  async create(userData: Partial<User>): Promise<any> {
    const existingUser = await this.usersRepository.findOneBy({ email: userData.email });
    if (existingUser) throw new BadRequestException('อีเมลนี้ถูกใช้งานแล้ว');

    const hashedPassword = await bcrypt.hash(userData.password as string, 10);
    const newUser = this.usersRepository.create({
      ...userData,
<<<<<<< HEAD
      password: hashedPassword, 
=======
      password: hashedPassword,
>>>>>>> feature/cart
      role: 'student', 
    });
    return await this.usersRepository.save(newUser);
  }

  // ---------------------------------------------------------
<<<<<<< HEAD
  // 👇 ส่วนสำหรับจัดการและค้นหาข้อมูล User
  // ---------------------------------------------------------

  // 🔍 3. (ฟังก์ชันใหม่) สำหรับให้ AuthService ใช้ค้นหาอีเมลตอนล็อกอิน
  async findByEmail(email: string) { // 👈 ลบ : Promise<User | undefined> ออกไปเลย
    return await this.usersRepository.findOneBy({ email });
  }

  // 🔍 4. ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้ทั้งหมดมาดู
=======
  // 🛠️ ส่วนจัดการข้อมูลสำหรับ Admin และการแสดงผลคอร์ส
  // ---------------------------------------------------------

  // 🔍 4. ดูผู้ใช้ทั้งหมด (สำหรับหน้า Admin)
>>>>>>> feature/cart
  async findAll() {
    return await this.usersRepository.find({
      relations: ['courses'], 
    });
  }

  // 🔍 5. ดูข้อมูลผู้ใช้รายคนพร้อมคอร์สที่ซื้อ (สำหรับหน้า My Courses)
  async findOneWithCourses(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['courses'],
    });
    if (!user) throw new NotFoundException('ไม่พบผู้ใช้งาน');
    return user;
  }

  // ➕ 6. บันทึกคอร์สลงบัญชีผู้ใช้ (ใช้ตอนจ่ายเงินสำเร็จ)
  async addCourseToUser(userId: number, courseId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['courses'],
    });
    const course = await this.coursesRepository.findOneBy({ id: courseId });

    if (!user || !course) throw new NotFoundException('ข้อมูลไม่ถูกต้อง');

    // เช็คว่ามีคอร์สนี้อยู่แล้วไหม (กันแอดซ้ำ)
    const alreadyHas = user.courses.some(c => c.id === courseId);
    if (!alreadyHas) {
      user.courses.push(course);
      return await this.usersRepository.save(user);
    }
    return user;
  }

  // ➖ 7. ลบคอร์สออกจากผู้ใช้
  async removeCourseFromUser(userId: number, courseId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['courses'],
    });
    if (!user) throw new NotFoundException('ไม่พบผู้ใช้งาน');

    user.courses = user.courses.filter(c => c.id !== courseId);
    return await this.usersRepository.save(user);
  }

  // 🗑️ 8. ลบผู้ใช้ (Admin สั่งลบ)
  async removeUser(id: number) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('ไม่พบผู้ใช้งาน');
    if (user.role === 'admin') throw new BadRequestException('ห้ามลบ Admin');
    return await this.usersRepository.remove(user);
  }

  async clearAllUsers() {
    return await this.usersRepository.clear();
  }
}