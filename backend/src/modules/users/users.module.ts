// src/modules/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Course } from '../courses/entities/course.entity'; // 👈 เพิ่มตัวนี้

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Course]), // 👈 เพิ่ม Course ในลิสต์นี้
    JwtModule.register({
      global: true,
      secret: 'MY_SECRET_KEY',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}