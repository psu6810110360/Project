import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../modules/users/users.service'; // ดึง UsersService มาใช้ค้นหาคน
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, pass: string): Promise<any> {
    console.log(`\n--- 🕵️‍♂️ แอบดูการ Login (จาก Auth Service) ---`);
    console.log(`📧 อีเมลที่รับมา: "${email}" | 🔑 รหัสผ่านที่รับมา: "${pass}"`);
    
    // ค้นหา User ผ่าน UsersService
    const user = await this.usersService.findByEmail(email); 
    
    console.log(`ค้นหาอีเมล ${email} ใน DB:`, user ? '✅ เจอข้อมูล!' : '❌ ไม่เจอข้อมูล!');

    if (!user) {
      throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    const isMatch = await bcrypt.compare(pass, user.password);

    if (!isMatch) {
      console.log(`4. สรุป: รหัสผ่าน **ไม่ตรงกัน**! (โดนเตะออก) ❌\n`);
      throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    console.log(`สรุป: รหัสผ่านตรงกันเป๊ะ! ล็อกอินสำเร็จ 🎉\n`);
    
    const payload = { sub: user.id, email: user.email, role: user.role };
    
    return {
      message: 'Login successful',
      token: this.jwtService.sign(payload),
    };
  }
}