// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../modules/users/users.module'; // 👈 นำเข้า UsersModule
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UsersModule, // 👈 ใส่ตรงนี้ด้วย
    JwtModule.register({
      global: true,
      secret: 'MY_SUPER_SECRET_KEY',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}