// src/modules/users/users.controller.ts
import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post('register')
  register(@Body() userData: any) {
    return this.usersService.create(userData);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  // 🛒 API สำหรับการซื้อคอร์ส / เพิ่มคอร์สเข้า User (พร้อม expiresAt optional)
  @Post(':userId/add-course/:courseId')
  addCourse(
    @Param('userId') userId: string,
    @Param('courseId') courseId: string,
    @Body() body: { expiresAt?: string | null },
  ) {
    const expiresAt = body?.expiresAt ? new Date(body.expiresAt) : null;
    return this.usersService.addCourseToUser(+userId, courseId, expiresAt);
  }

  // ❌ API สำหรับลบคอร์สแบบ manual (ไม่มี payment record)
  @Delete(':userId/remove-course/:courseId')
  removeCourse(
    @Param('userId') userId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.usersService.removeCourseFromUser(+userId, courseId);
  }

  @Delete(':id')
  removeUser(@Param('id') id: string) {
    return this.usersService.removeUser(+id);
  }
}