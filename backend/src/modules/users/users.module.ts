// users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt'; // 👈 1. ต้อง Import ตัวนี้เข้ามา
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    // 👇 2. ต้องมีบล็อก JwtModule.register ตรงนี้ ระบบถึงจะสร้าง Token ได้
    JwtModule.register({
      global: true,
      secret: 'MY_SECRET_KEY', // คีย์ลับ (ควรเปลี่ยนให้เดายากๆ)
      signOptions: { expiresIn: '1d' }, // Token มีอายุ 1 วัน
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}