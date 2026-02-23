import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('login')
  async login(@Body() body: any) {
    // 1. ปริ้นดูว่าหน้าเว็บส่งอะไรมาให้ Backend บ้าง?
    console.log('\n--- 🛑 มีความพยายามเข้าสู่ระบบ ---');
    console.log('📥 ข้อมูลที่ได้รับจากหน้าเว็บ:', body);

    const email = body?.email;
    const password = body?.password;

    // 2. ปริ้นดูว่าหาใน Database เจอไหม?
    const user = await this.usersService.validateUser(email, password);
    console.log('🔍 ผลลัพธ์ที่ค้นหาเจอใน Database:', user);
    console.log('----------------------------------\n');

    if (!user) {
      throw new HttpException('อีเมลหรือรหัสผ่านไม่ถูกต้อง', HttpStatus.UNAUTHORIZED);
    }
    return { message: 'เข้าสู่ระบบสำเร็จ', user };
  }

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
}