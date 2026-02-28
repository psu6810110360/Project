import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // 🔍 ดึงข้อมูลผู้ใช้ 1 คน (พร้อมคอร์สที่ซื้อไว้) - เปลี่ยนมาใช้ .findOne() ให้ตรงกับ Service
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  // 🛒 API สำหรับการซื้อคอร์ส / เพิ่มคอร์สเข้า User
  @Post(':userId/add-course/:courseId')
  addCourse(
    @Param('userId') userId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.usersService.addCourseToUser(+userId, courseId);
  }

  // ❌ API สำหรับลบคอร์ส (Admin หรือ User กดยกเลิก)
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