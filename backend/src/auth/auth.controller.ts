import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() body: any) {
    console.log('\n--- 🛑 มีความพยายามเข้าสู่ระบบ (ผ่าน Auth Controller) ---');
    console.log('📥 ข้อมูลที่ได้รับจากหน้าเว็บ:', body);

    const email = body?.email;
    const password = body?.password;

    const result = await this.authService.signIn(email, password); 
    
    console.log('🔍 ข้อมูลที่จะส่งกลับไปให้หน้าเว็บ (React):', result);
    return result; 
  }
}