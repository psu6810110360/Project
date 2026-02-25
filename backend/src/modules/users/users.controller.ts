// 👇 1. อย่าลืมเพิ่ม Get และ Delete เข้ามาใน import ด้วยนะครับ
import { Controller, Post, Body, HttpException, HttpStatus, Get, Delete } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(
    // 👇 ระบุชื่อตัวแปรของหน้าสมัครสมาชิกด้วยเช่นกัน
    @Body('firstName') firstName: string,
    @Body('lastName') lastName: string,
    @Body('phone') phone: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    try {
      const user = await this.usersService.create({
        firstName,
        lastName,
        phone,
        email,
        password,
      });
      return { message: 'สมัครสมาชิกสำเร็จ', user };
    } catch (error) {
      throw new HttpException('อีเมลนี้มีในระบบแล้ว หรือข้อมูลไม่ถูกต้อง', HttpStatus.BAD_REQUEST);
    }
  }

  // ---------------------------------------------------------
  // 👇 ส่วนที่เพิ่มเข้ามาใหม่สำหรับจัดการข้อมูล User
  // ---------------------------------------------------------

  // 🔍 1. ดูผู้ใช้ทั้งหมด
  // วิธีใช้: เปิด Browser แล้วพิมพ์ http://localhost:3000/users
  @Get()
  async getAllUsers() {
    return await this.usersService.findAll();
  }

  // 🗑️ 2. ลบผู้ใช้ทั้งหมด 
  // วิธีใช้: ใช้ Postman หรือ Thunder Client ยิง Request แบบ DELETE ไปที่ http://localhost:3000/users/clear
  @Delete('clear')
  async clearUsers() {
    return await this.usersService.clearAllUsers();
  }
}