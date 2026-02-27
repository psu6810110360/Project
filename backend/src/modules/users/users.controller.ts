import { Controller, Post, Body, HttpException, HttpStatus, Get, Delete, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

<<<<<<< HEAD
=======
  // 🔑 1. เข้าสู่ระบบ
  @Post('login')
  async login(@Body() body: any) {
    const email = body?.email;
    const password = body?.password;
    const result = await this.usersService.login(email, password);
    return result;
  }

  // 📝 2. สมัครสมาชิก
>>>>>>> feature/cart
  @Post('register')
  async register(
    @Body('firstName') firstName: string,
    @Body('lastName') lastName: string,
    @Body('phone') phone: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    try {
      const user = await this.usersService.create({
        firstName, lastName, phone, email, password,
      });
      return { message: 'สมัครสมาชิกสำเร็จ', user };
    } catch (error) {
      throw new HttpException('อีเมลนี้มีในระบบแล้ว หรือข้อมูลไม่ถูกต้อง', HttpStatus.BAD_REQUEST);
    }
  }

  // ---------------------------------------------------------
  // 👑 ส่วนสำหรับ Admin และการแสดงผลข้อมูล
  // ---------------------------------------------------------

  // 🔍 3. ดูผู้ใช้ทั้งหมด (Admin ใช้)
  @Get()
  async getAllUsers() {
    return await this.usersService.findAll();
  }

  // 🎯 4. ดูข้อมูลผู้ใช้รายบุคคล (นักเรียนใช้ในหน้า My Course) 👈 **จุดที่เพิ่มเข้ามา**
  // วิธีใช้: GET http://localhost:3000/users/1
  @Get(':id')
  async getUser(@Param('id') id: number) {
    // เรียกฟังก์ชัน findOneWithCourses ที่ดึง Relations คอร์สออกมาด้วย
    return await this.usersService.findOneWithCourses(id);
  }

  // ➕ 5. Admin สั่งเพิ่มคอร์สให้ผู้ใช้รายบุคคล
  @Post(':userId/add-course/:courseId')
  async addCourse(
    @Param('userId') userId: number,
    @Param('courseId') courseId: string
  ) {
    return await this.usersService.addCourseToUser(userId, courseId);
  }

  // ➖ 6. Admin/User สั่งลบคอร์สออกจากผู้ใช้
  @Delete(':userId/remove-course/:courseId')
  async removeCourse(
    @Param('userId') userId: number,
    @Param('courseId') courseId: string
  ) {
    return await this.usersService.removeCourseFromUser(userId, courseId);
  }

  // 🗑️ 7. ลบผู้ใช้ทั้งหมดออกจากระบบ
  @Delete('clear')
  async clearUsers() {
    return await this.usersService.clearAllUsers();
  }

  // 🗑️ 8. Admin สั่งลบ User ทิ้งรายบุคคล
  @Delete(':id')
  async deleteUser(@Param('id') id: number) {
    return await this.usersService.removeUser(id);
  }
}