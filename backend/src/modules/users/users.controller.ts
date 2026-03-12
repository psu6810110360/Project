// src/modules/users/users.controller.ts
import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // ✅ เพิ่ม Import AuthGuard
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

  // ===============================================
  // 🟢 3 API ใหม่สำหรับระบบ Profile (ต้องอยู่เหนือ :id)
  // ===============================================
  @UseGuards(AuthGuard('jwt')) // 🔒 บังคับว่าต้องมี Token
  @Get('profile')
  getProfile(@Request() req: any) {
    const userId = req.user.id || req.user.sub; 
    return this.usersService.getProfile(+userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('profile')
  updateProfile(@Request() req: any, @Body() updateData: { name: string }) {
    const userId = req.user.id || req.user.sub;
    return this.usersService.updateProfile(+userId, updateData);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('change-password')
  changePassword(@Request() req: any, @Body() passwords: any) {
    const userId = req.user.id || req.user.sub;
    return this.usersService.changePassword(+userId, passwords);
  }
  // ===============================================

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